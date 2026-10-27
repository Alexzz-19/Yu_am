-- Ejecutar después de 0006. Solo el servidor/administrador puede conceder VIP.
BEGIN;
ALTER TABLE public.nodes ADD COLUMN IF NOT EXISTS is_demo_vip boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.yuam_ingest_hardware(
  p_token text, p_ppm double precision, p_ph double precision, p_temperature double precision,
  p_lux double precision, p_pm25 double precision, p_humidity double precision
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_node uuid; v_reactor uuid; v_last timestamptz; v_now timestamptz;
  v_vip boolean; v_interval_seconds integer;
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
  SELECT id, is_demo_vip INTO v_node, v_vip FROM public.nodes WHERE token = p_token FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('status', 'unauthorized'); END IF;
  v_now := clock_timestamp();
  v_interval_seconds := CASE WHEN v_vip THEN 10 ELSE 1800 END;
  SELECT id INTO v_reactor FROM public.reactors WHERE node_id = v_node;
  IF v_reactor IS NULL THEN RETURN jsonb_build_object('status', 'unauthorized'); END IF;
  SELECT max(created_at) INTO v_last FROM public.readings WHERE reactor_id = v_reactor;
  IF v_last IS NOT NULL AND v_last > v_now - make_interval(secs => v_interval_seconds) THEN
    RETURN jsonb_build_object('status', 'rate_limited', 'interval_seconds', v_interval_seconds,
      'retry_after', ceil(extract(epoch FROM v_last + make_interval(secs => v_interval_seconds) - v_now)));
  END IF;
  INSERT INTO public.readings(reactor_id, ppm_value, ph_value, water_temperature, light_lux, pm25, humidity, status_quality, created_at)
    VALUES (v_reactor, p_ppm, p_ph, p_temperature, p_lux, p_pm25, p_humidity, 'Registrado', v_now);
  RETURN jsonb_build_object('status', 'accepted', 'nodo_id', v_node, 'created_at', v_now, 'interval_seconds', v_interval_seconds);
END;
$$;
REVOKE ALL ON FUNCTION public.yuam_ingest_hardware(text,double precision,double precision,double precision,double precision,double precision,double precision) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.yuam_ingest_hardware(text,double precision,double precision,double precision,double precision,double precision,double precision) TO service_role;
-- La firma de seis parámetros de 0006 sigue delegando en esta función.
-- Las escrituras directas a nodes continúan revocadas a anon/authenticated (0004).
NOTIFY pgrst, 'reload schema';
COMMIT;
