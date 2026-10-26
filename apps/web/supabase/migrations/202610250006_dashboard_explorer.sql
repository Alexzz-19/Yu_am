-- Reconecta el dashboard al esquema nodes -> reactors -> readings.
-- Ejecutar después de 0005 en el SQL Editor del proyecto de apps/web.
BEGIN;

ALTER TABLE public.readings ADD COLUMN IF NOT EXISTS humidity real
  CHECK (humidity BETWEEN 0 AND 100);
ALTER TABLE public.nodes ADD COLUMN IF NOT EXISTS category text
  CHECK (category IN ('Captura de Carbono', 'Tratamiento de Agua', 'Biomasa', 'Investigación'));
ALTER TABLE public.nodes ADD COLUMN IF NOT EXISTS university text
  CHECK (char_length(university) <= 160);

-- La firma anterior se mantiene para los clientes desplegados antes de esta migración.
CREATE OR REPLACE FUNCTION public.yuam_ingest_hardware(
  p_token text, p_ppm double precision, p_ph double precision, p_temperature double precision,
  p_lux double precision, p_pm25 double precision, p_humidity double precision
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_node uuid; v_reactor uuid; v_last timestamptz; v_now timestamptz;
BEGIN
  IF (p_ppm IS NULL AND p_ph IS NULL AND p_temperature IS NULL AND p_lux IS NULL AND p_pm25 IS NULL AND p_humidity IS NULL)
    OR (p_ppm IS NOT NULL AND NOT (p_ppm BETWEEN 0 AND 1000000))
    OR (p_ph IS NOT NULL AND NOT (p_ph BETWEEN 0 AND 14))
    OR (p_temperature IS NOT NULL AND NOT (p_temperature BETWEEN -55 AND 125))
    OR (p_lux IS NOT NULL AND NOT (p_lux BETWEEN 0 AND 1000000))
    OR (p_pm25 IS NOT NULL AND NOT (p_pm25 BETWEEN 0 AND 1000000))
    OR (p_humidity IS NOT NULL AND NOT (p_humidity BETWEEN 0 AND 100)) THEN
    RAISE EXCEPTION 'Invalid measurement' USING ERRCODE = '23514';
  END IF;
  SELECT id INTO v_node FROM public.nodes WHERE token = p_token FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('status', 'unauthorized'); END IF;
  v_now := clock_timestamp();
  SELECT id INTO v_reactor FROM public.reactors WHERE node_id = v_node;
  IF v_reactor IS NULL THEN RETURN jsonb_build_object('status', 'unauthorized'); END IF;
  SELECT max(created_at) INTO v_last FROM public.readings WHERE reactor_id = v_reactor;
  IF v_last IS NOT NULL AND v_last > v_now - interval '30 minutes' THEN
    RETURN jsonb_build_object('status', 'rate_limited',
      'retry_after', ceil(extract(epoch FROM v_last + interval '30 minutes' - v_now)));
  END IF;
  INSERT INTO public.readings(reactor_id, ppm_value, ph_value, water_temperature, light_lux, pm25, humidity, status_quality, created_at)
    VALUES (v_reactor, p_ppm, p_ph, p_temperature, p_lux, p_pm25, p_humidity, 'Registrado', v_now);
  RETURN jsonb_build_object('status', 'accepted', 'nodo_id', v_node, 'created_at', v_now);
END;
$$;
REVOKE ALL ON FUNCTION public.yuam_ingest_hardware(text,double precision,double precision,double precision,double precision,double precision,double precision) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.yuam_ingest_hardware(text,double precision,double precision,double precision,double precision,double precision,double precision) TO service_role;

CREATE OR REPLACE FUNCTION public.yuam_ingest_hardware(
  p_token text, p_ppm double precision, p_ph double precision, p_temperature double precision,
  p_lux double precision, p_pm25 double precision
) RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  SELECT public.yuam_ingest_hardware(p_token, p_ppm, p_ph, p_temperature, p_lux, p_pm25, NULL::double precision);
$$;
REVOKE ALL ON FUNCTION public.yuam_ingest_hardware(text,double precision,double precision,double precision,double precision,double precision) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.yuam_ingest_hardware(text,double precision,double precision,double precision,double precision,double precision) TO service_role;

CREATE OR REPLACE FUNCTION public.yuam_public_node_stats()
RETURNS TABLE(id uuid, nombre_nodo text, ubicacion_ofuscada jsonb, estado text, ultimo_envio timestamptz, telemetry jsonb)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT n.id, n.name, jsonb_build_object('zona', n.city || ', ' || n.country,
      'lat', round(n.lat::numeric, 2), 'lng', round(n.lng::numeric, 2)),
    CASE WHEN latest.created_at > now() - interval '30 minutes' THEN 'activo' ELSE 'inactivo' END,
    latest.created_at,
    jsonb_build_object('last', jsonb_build_object('ppm', latest.ppm_value, 'pm25', latest.pm25,
      'temperature', latest.water_temperature, 'ph', latest.ph_value, 'lux', latest.light_lux, 'humidity', latest.humidity),
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
      'lux', avg(light_lux) FILTER (WHERE created_at >= now() - interval '7 days'),
      'humidity', avg(humidity) FILTER (WHERE created_at >= now() - interval '7 days')) AS week,
      jsonb_build_object('ppm', avg(ppm_value), 'pm25', avg(pm25), 'temperature', avg(water_temperature),
        'ph', avg(ph_value), 'lux', avg(light_lux), 'humidity', avg(humidity)) AS month,
      count(*) FILTER (WHERE created_at >= now() - interval '7 days') AS week_samples,
      count(*) AS month_samples
    FROM public.readings WHERE reactor_id = r.id AND created_at >= now() - interval '30 days'
  ) averages ON true
  ORDER BY n.created_at DESC LIMIT 1000;
$$;
REVOKE ALL ON FUNCTION public.yuam_public_node_stats() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.yuam_public_node_stats() TO service_role;

-- Realtime respeta las políticas RLS por propietario ya aplicadas en 0004.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
    AND NOT EXISTS (SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'readings') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.readings;
  END IF;
END;
$$;

NOTIFY pgrst, 'reload schema';
COMMIT;
