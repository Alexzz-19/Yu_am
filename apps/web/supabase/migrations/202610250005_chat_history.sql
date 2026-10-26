-- Ejecutar en el SQL Editor del proyecto Supabase usado por apps/web.
BEGIN;

CREATE TABLE IF NOT EXISTS public.yum_chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 4000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS yuam_yum_chat_history_user_time
  ON public.yum_chat_history(user_id, created_at DESC);
ALTER TABLE public.yum_chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yum_chat_history FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.yum_chat_history FROM PUBLIC, anon;
GRANT SELECT, INSERT ON public.yum_chat_history TO authenticated;
GRANT ALL ON public.yum_chat_history TO service_role;

DROP POLICY IF EXISTS yum_chat_history_select_owner ON public.yum_chat_history;
CREATE POLICY yum_chat_history_select_owner ON public.yum_chat_history
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS yum_chat_history_insert_owner ON public.yum_chat_history;
CREATE POLICY yum_chat_history_insert_owner ON public.yum_chat_history
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- La función serializa las lecturas por nodo y aplica el intervalo de 30 minutos
-- incluso si llegan solicitudes simultáneas al endpoint.
CREATE OR REPLACE FUNCTION public.yuam_ingest_hardware(
  p_token text, p_ppm double precision, p_ph double precision, p_temperature double precision,
  p_lux double precision, p_pm25 double precision
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_node uuid; v_reactor uuid; v_last timestamptz; v_now timestamptz := clock_timestamp();
BEGIN
  IF (p_ppm IS NULL AND p_ph IS NULL AND p_temperature IS NULL AND p_lux IS NULL AND p_pm25 IS NULL)
    OR (p_ppm IS NOT NULL AND NOT (p_ppm BETWEEN 0 AND 1000000))
    OR (p_ph IS NOT NULL AND NOT (p_ph BETWEEN 0 AND 14))
    OR (p_temperature IS NOT NULL AND NOT (p_temperature BETWEEN -55 AND 125))
    OR (p_lux IS NOT NULL AND NOT (p_lux BETWEEN 0 AND 1000000))
    OR (p_pm25 IS NOT NULL AND NOT (p_pm25 BETWEEN 0 AND 1000000)) THEN
    RAISE EXCEPTION 'Invalid measurement' USING ERRCODE = '23514';
  END IF;
  SELECT id INTO v_node FROM public.nodes WHERE token = p_token FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('status', 'unauthorized'); END IF;
  SELECT id INTO v_reactor FROM public.reactors WHERE node_id = v_node;
  IF v_reactor IS NULL THEN RETURN jsonb_build_object('status', 'unauthorized'); END IF;
  SELECT max(created_at) INTO v_last FROM public.readings WHERE reactor_id = v_reactor;
  IF v_last IS NOT NULL AND v_last > v_now - interval '30 minutes' THEN
    RETURN jsonb_build_object('status', 'rate_limited',
      'retry_after', ceil(extract(epoch FROM v_last + interval '30 minutes' - v_now)));
  END IF;
  INSERT INTO public.readings(reactor_id, ppm_value, ph_value, water_temperature, light_lux, pm25, status_quality, created_at)
    VALUES (v_reactor, p_ppm, p_ph, p_temperature, p_lux, p_pm25, 'Registrado', v_now);
  RETURN jsonb_build_object('status', 'accepted', 'nodo_id', v_node, 'created_at', v_now);
END;
$$;
REVOKE ALL ON FUNCTION public.yuam_ingest_hardware(text,double precision,double precision,double precision,double precision,double precision) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.yuam_ingest_hardware(text,double precision,double precision,double precision,double precision,double precision) TO service_role;

NOTIFY pgrst, 'reload schema';
COMMIT;
