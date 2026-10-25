-- Aplicar después de packages/database/schema.sql con el SQL Editor de Supabase.
BEGIN;

ALTER TABLE public.telemetria_mq135 ADD COLUMN IF NOT EXISTS ph NUMERIC(4,2)
  CHECK (ph >= 0 AND ph <= 14);

-- El secreto completo solo existe en la respuesta de creación/rotación.
CREATE TABLE IF NOT EXISTS public.yuam_node_credentials (
  nodo_id UUID PRIMARY KEY REFERENCES public.nodos_iot(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL CHECK (token_hash ~ '^[a-f0-9]{64}$'),
  ultimo_envio TIMESTAMPTZ
);
ALTER TABLE public.yuam_node_credentials ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.yuam_node_credentials FROM PUBLIC, anon, authenticated;

-- Las escrituras pasan por funciones transaccionales; las políticas de lectura
-- del esquema base siguen limitando nodos y telemetría a su propietario.
REVOKE INSERT, UPDATE, DELETE ON public.nodos_iot FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.telemetria_mq135 FROM anon, authenticated;
GRANT SELECT ON public.nodos_iot, public.telemetria_mq135 TO authenticated;

CREATE OR REPLACE FUNCTION public.yuam_register_node(
  p_name TEXT, p_zone TEXT, p_lat DOUBLE PRECISION, p_lng DOUBLE PRECISION, p_token_hash TEXT
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_user UUID := auth.uid();
  v_id UUID;
BEGIN
  IF v_user IS NULL OR coalesce((auth.jwt()->>'is_anonymous')::boolean, false) THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  IF p_name IS NULL OR length(trim(p_name)) NOT BETWEEN 1 AND 100
    OR p_zone IS NULL OR length(trim(p_zone)) NOT BETWEEN 1 AND 150
    OR p_lat IS NULL OR NOT (p_lat BETWEEN -90 AND 90)
    OR p_lng IS NULL OR NOT (p_lng BETWEEN -180 AND 180)
    OR p_token_hash IS NULL OR p_token_hash !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'Invalid node' USING ERRCODE = '23514';
  END IF;
  INSERT INTO public.perfiles(id, nombre_completo)
    VALUES (v_user, left(coalesce(nullif(auth.jwt()->'user_metadata'->>'full_name', ''), 'Investigador YUAM'), 150))
    ON CONFLICT (id) DO NOTHING;
  -- Serializa altas del mismo usuario para respetar el máximo bajo concurrencia.
  PERFORM 1 FROM public.perfiles WHERE id = v_user FOR UPDATE;
  IF (SELECT count(*) FROM public.nodos_iot WHERE usuario_id = v_user) >= 4 THEN
    RAISE EXCEPTION 'Maximum four nodes' USING ERRCODE = '23514';
  END IF;
  INSERT INTO public.nodos_iot(usuario_id, nombre_nodo, ubicacion_ofuscada, estado)
    VALUES (v_user, trim(p_name), jsonb_build_object('zona', trim(p_zone),
      'lat', round(p_lat::numeric, 2), 'lng', round(p_lng::numeric, 2)), 'inactivo')
    RETURNING id INTO v_id;
  INSERT INTO public.yuam_node_credentials(nodo_id, token_hash) VALUES (v_id, p_token_hash);
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.yuam_rotate_node_token(p_node_id UUID, p_token_hash TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501'; END IF;
  IF p_token_hash IS NULL OR p_token_hash !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'Invalid hash' USING ERRCODE = '23514';
  END IF;
  -- Bloquear credencial primero, igual que en ingesta, evita ciclos de bloqueos.
  PERFORM 1 FROM public.yuam_node_credentials c JOIN public.nodos_iot n ON n.id = c.nodo_id
    WHERE n.id = p_node_id AND n.usuario_id = auth.uid() FOR UPDATE OF c;
  IF NOT FOUND THEN RAISE EXCEPTION 'Node not found' USING ERRCODE = 'P0002'; END IF;
  UPDATE public.yuam_node_credentials SET token_hash = p_token_hash WHERE nodo_id = p_node_id;
  -- No reiniciar ultimo_envio: rotar el token no evade el límite de frecuencia.
END;
$$;

CREATE OR REPLACE FUNCTION public.yuam_delete_node(p_node_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501'; END IF;
  PERFORM 1 FROM public.yuam_node_credentials c JOIN public.nodos_iot n ON n.id = c.nodo_id
    WHERE n.id = p_node_id AND n.usuario_id = auth.uid() FOR UPDATE OF c;
  IF NOT FOUND THEN RAISE EXCEPTION 'Node not found' USING ERRCODE = 'P0002'; END IF;
  DELETE FROM public.nodos_iot WHERE id = p_node_id AND usuario_id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.yuam_ingest_telemetry(
  p_token_hash TEXT, p_co2 DOUBLE PRECISION, p_ph DOUBLE PRECISION, p_temperature DOUBLE PRECISION
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_node UUID;
  v_last TIMESTAMPTZ;
  v_now TIMESTAMPTZ;
BEGIN
  -- Solo service_role puede ejecutar esta función (ver GRANT al final).
  IF (p_co2 IS NULL AND p_ph IS NULL AND p_temperature IS NULL)
    OR (p_co2 IS NOT NULL AND NOT (p_co2 BETWEEN 0 AND 1000000))
    OR (p_ph IS NOT NULL AND NOT (p_ph BETWEEN 0 AND 14))
    OR (p_temperature IS NOT NULL AND NOT (p_temperature BETWEEN -55 AND 125)) THEN
    RAISE EXCEPTION 'Invalid measurement' USING ERRCODE = '23514';
  END IF;
  SELECT nodo_id, ultimo_envio INTO v_node, v_last
    FROM public.yuam_node_credentials WHERE token_hash = p_token_hash FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('status', 'unauthorized'); END IF;
  -- Medir después de obtener el bloqueo, usando el reloj real de PostgreSQL.
  v_now := clock_timestamp();
  IF v_last IS NOT NULL AND v_now - v_last < interval '60 seconds' THEN
    RETURN jsonb_build_object('status', 'rate_limited',
      'retry_after', ceil(extract(epoch FROM (v_last + interval '60 seconds' - v_now))));
  END IF;
  INSERT INTO public.telemetria_mq135(nodo_id, ppm_co2, ph, temperatura, created_at, updated_at)
    VALUES (v_node, p_co2, p_ph, p_temperature, v_now, v_now);
  UPDATE public.yuam_node_credentials SET ultimo_envio = v_now WHERE nodo_id = v_node;
  UPDATE public.nodos_iot SET estado = 'activo', updated_at = v_now WHERE id = v_node;
  RETURN jsonb_build_object('status', 'accepted', 'nodo_id', v_node, 'created_at', v_now);
END;
$$;

-- Proyección pública mínima: sin ID de usuario, correo, tokens ni coordenadas exactas.
CREATE OR REPLACE FUNCTION public.yuam_public_nodes()
RETURNS TABLE(id UUID, nombre_nodo TEXT, ubicacion_ofuscada JSONB, estado TEXT, ultimo_envio TIMESTAMPTZ)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT n.id, n.nombre_nodo::text,
    jsonb_build_object('zona', n.ubicacion_ofuscada->>'zona',
      'lat', round((n.ubicacion_ofuscada->>'lat')::numeric, 2),
      'lng', round((n.ubicacion_ofuscada->>'lng')::numeric, 2)),
    CASE WHEN c.ultimo_envio > now() - interval '5 minutes' AND n.estado = 'activo'
      THEN 'activo' ELSE 'inactivo' END,
    c.ultimo_envio
  FROM public.nodos_iot n JOIN public.yuam_node_credentials c ON c.nodo_id = n.id
  ORDER BY c.ultimo_envio DESC NULLS LAST, n.created_at DESC LIMIT 1000;
$$;

REVOKE ALL ON FUNCTION public.yuam_register_node(TEXT,TEXT,DOUBLE PRECISION,DOUBLE PRECISION,TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.yuam_rotate_node_token(UUID,TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.yuam_delete_node(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.yuam_ingest_telemetry(TEXT,DOUBLE PRECISION,DOUBLE PRECISION,DOUBLE PRECISION) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.yuam_public_nodes() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.yuam_register_node(TEXT,TEXT,DOUBLE PRECISION,DOUBLE PRECISION,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.yuam_rotate_node_token(UUID,TEXT), public.yuam_delete_node(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.yuam_ingest_telemetry(TEXT,DOUBLE PRECISION,DOUBLE PRECISION,DOUBLE PRECISION) TO service_role;
GRANT EXECUTE ON FUNCTION public.yuam_public_nodes() TO anon, authenticated;

COMMIT;
