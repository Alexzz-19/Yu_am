-- Ejecutar en el SQL Editor del proyecto Supabase usado por apps/web.
-- Añade campos y funciones; conserva nodos, reactores y lecturas existentes.
BEGIN;

ALTER TABLE public.nodes ADD COLUMN IF NOT EXISTS board_type text NOT NULL DEFAULT 'ESP32';
ALTER TABLE public.nodes ADD COLUMN IF NOT EXISTS algae_type text NOT NULL DEFAULT 'Chlorella vulgaris';
ALTER TABLE public.nodes ADD COLUMN IF NOT EXISTS sensors text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.reactors ADD COLUMN IF NOT EXISTS node_id uuid REFERENCES public.nodes(id) ON DELETE CASCADE;
ALTER TABLE public.reactors ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.reactors ADD COLUMN IF NOT EXISTS sensors text[] NOT NULL DEFAULT '{}';
CREATE UNIQUE INDEX IF NOT EXISTS yuam_reactors_node_unique ON public.reactors(node_id);
ALTER TABLE public.readings ADD COLUMN IF NOT EXISTS pm25 real CHECK (pm25 >= 0);
CREATE INDEX IF NOT EXISTS yuam_readings_reactor_time ON public.readings(reactor_id, created_at DESC);
-- Preservar la configuración técnica de reactores ya enlazados por su clave.
UPDATE public.nodes n SET board_type = r.board_type, algae_type = r.algae_type, sensors = r.sensors
  FROM public.reactors r WHERE r.api_key = n.token;

CREATE OR REPLACE FUNCTION public.yuam_sync_reactor() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_id uuid; v_previous_token text;
BEGIN
  IF TG_OP = 'UPDATE' THEN v_previous_token := OLD.token; END IF;
  SELECT id INTO v_id FROM public.reactors
    WHERE node_id = NEW.id OR (node_id IS NULL AND api_key IN (NEW.token, v_previous_token))
    ORDER BY node_id NULLS LAST LIMIT 1 FOR UPDATE;
  IF v_id IS NULL THEN
    INSERT INTO public.reactors(node_id, user_id, name, board_type, algae_type, sensors, location_name, latitude, longitude, api_key)
      VALUES (NEW.id, NEW.user_id, NEW.name, NEW.board_type, NEW.algae_type, NEW.sensors,
        NEW.city || ', ' || NEW.country, NEW.lat, NEW.lng, NEW.token);
  ELSE
    UPDATE public.reactors SET node_id = NEW.id, user_id = NEW.user_id, name = NEW.name,
      board_type = NEW.board_type, algae_type = NEW.algae_type, sensors = NEW.sensors,
      location_name = NEW.city || ', ' || NEW.country, latitude = NEW.lat, longitude = NEW.lng, api_key = NEW.token
      WHERE id = v_id;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS yuam_sync_reactor ON public.nodes;
CREATE TRIGGER yuam_sync_reactor AFTER INSERT OR UPDATE ON public.nodes
  FOR EACH ROW EXECUTE FUNCTION public.yuam_sync_reactor();
REVOKE ALL ON FUNCTION public.yuam_sync_reactor() FROM PUBLIC, anon, authenticated;
-- Reutilizar reactores existentes por clave conserva sus lecturas históricas.
UPDATE public.nodes SET board_type = board_type;

CREATE OR REPLACE FUNCTION public.yuam_delete_node_readings() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  DELETE FROM public.readings WHERE reactor_id IN (SELECT id FROM public.reactors WHERE node_id = OLD.id);
  RETURN OLD;
END;
$$;
DROP TRIGGER IF EXISTS yuam_delete_node_readings ON public.nodes;
CREATE TRIGGER yuam_delete_node_readings BEFORE DELETE ON public.nodes
  FOR EACH ROW EXECUTE FUNCTION public.yuam_delete_node_readings();
REVOKE ALL ON FUNCTION public.yuam_delete_node_readings() FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS public.yuam_chat_usage (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date date NOT NULL,
  used integer NOT NULL CHECK (used BETWEEN 0 AND 5),
  PRIMARY KEY (user_id, usage_date)
);
ALTER TABLE public.yuam_chat_usage ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.yuam_chat_usage FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.yuam_chat_usage TO service_role;

CREATE OR REPLACE FUNCTION public.yuam_consume_chat_quota(p_user_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_day date := (now() AT TIME ZONE 'UTC')::date; v_used integer;
BEGIN
  INSERT INTO public.yuam_chat_usage AS usage(user_id, usage_date, used) VALUES (p_user_id, v_day, 1)
    ON CONFLICT (user_id, usage_date) DO UPDATE SET used = usage.used + 1
    WHERE usage.used < 5 RETURNING used INTO v_used;
  RETURN jsonb_build_object('allowed', v_used IS NOT NULL, 'used', coalesce(v_used, 5),
    'remaining', 5 - coalesce(v_used, 5), 'limit', 5,
    'resetsAt', ((v_day + 1)::timestamp AT TIME ZONE 'UTC'));
END;
$$;
REVOKE ALL ON FUNCTION public.yuam_consume_chat_quota(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.yuam_consume_chat_quota(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.yuam_public_node_stats()
RETURNS TABLE(id uuid, nombre_nodo text, ubicacion_ofuscada jsonb, estado text, ultimo_envio timestamptz, telemetry jsonb)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT n.id, n.name, jsonb_build_object('zona', n.city || ', ' || n.country,
      'lat', round(n.lat::numeric, 2), 'lng', round(n.lng::numeric, 2)),
    CASE WHEN latest.created_at > now() - interval '30 minutes' THEN 'activo' ELSE 'inactivo' END,
    latest.created_at,
    jsonb_build_object('last', jsonb_build_object('ppm', latest.ppm_value, 'pm25', latest.pm25,
      'temperature', latest.water_temperature, 'ph', latest.ph_value, 'lux', latest.light_lux),
      'week', averages.week, 'month', averages.month,
      'weekSamples', coalesce(averages.week_samples, 0), 'monthSamples', coalesce(averages.month_samples, 0))
  FROM public.nodes n LEFT JOIN public.reactors r ON r.node_id = n.id
  LEFT JOIN LATERAL (SELECT * FROM public.readings WHERE reactor_id = r.id ORDER BY created_at DESC LIMIT 1) latest ON true
  LEFT JOIN LATERAL (
    SELECT jsonb_build_object(
      'ppm', avg(ppm_value) FILTER (WHERE created_at >= now() - interval '7 days'),
      'pm25', avg(pm25) FILTER (WHERE created_at >= now() - interval '7 days'),
      'temperature', avg(water_temperature) FILTER (WHERE created_at >= now() - interval '7 days'),
      'ph', avg(ph_value) FILTER (WHERE created_at >= now() - interval '7 days'),
      'lux', avg(light_lux) FILTER (WHERE created_at >= now() - interval '7 days')) "week",
      jsonb_build_object('ppm', avg(ppm_value), 'pm25', avg(pm25), 'temperature', avg(water_temperature),
        'ph', avg(ph_value), 'lux', avg(light_lux)) "month"
      count(*) FILTER (WHERE created_at >= now() - interval '7 days') week_samples, count(*) month_samples
    FROM public.readings WHERE reactor_id = r.id AND created_at >= now() - interval '30 days'
  ) averages ON true
  ORDER BY n.created_at DESC LIMIT 1000;
$$;
REVOKE ALL ON FUNCTION public.yuam_public_node_stats() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.yuam_public_node_stats() TO service_role;

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
  IF v_last > v_now - interval '60 seconds' THEN
    RETURN jsonb_build_object('status', 'rate_limited', 'retry_after', ceil(extract(epoch FROM v_last + interval '60 seconds' - v_now)));
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
