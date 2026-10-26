-- Protege las claves del firmware. El mapa público continúa mediante la API.
BEGIN;
ALTER TABLE public.nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nodes FORCE ROW LEVEL SECURITY;
ALTER TABLE public.reactors FORCE ROW LEVEL SECURITY;
ALTER TABLE public.readings FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.nodes, public.reactors, public.readings FROM PUBLIC, anon, authenticated;
REVOKE SELECT (token) ON public.nodes FROM PUBLIC, anon;
REVOKE SELECT (api_key) ON public.reactors FROM PUBLIC, anon;
GRANT SELECT ON public.nodes, public.reactors, public.readings TO authenticated;
GRANT ALL ON public.nodes, public.reactors, public.readings TO service_role;

DROP POLICY IF EXISTS yuam_nodes_owner_read ON public.nodes;
CREATE POLICY yuam_nodes_owner_read ON public.nodes FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS yuam_nodes_owner_guard ON public.nodes;
CREATE POLICY yuam_nodes_owner_guard ON public.nodes AS RESTRICTIVE FOR ALL TO PUBLIC
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS yuam_reactors_owner_read ON public.reactors;
CREATE POLICY yuam_reactors_owner_read ON public.reactors FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS yuam_reactors_owner_guard ON public.reactors;
CREATE POLICY yuam_reactors_owner_guard ON public.reactors AS RESTRICTIVE FOR ALL TO PUBLIC
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS yuam_readings_owner_read ON public.readings;
CREATE POLICY yuam_readings_owner_read ON public.readings FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.reactors r WHERE r.id = reactor_id AND r.user_id = auth.uid()));
DROP POLICY IF EXISTS yuam_readings_owner_guard ON public.readings;
CREATE POLICY yuam_readings_owner_guard ON public.readings AS RESTRICTIVE FOR ALL TO PUBLIC
  USING (EXISTS (SELECT 1 FROM public.reactors r WHERE r.id = reactor_id AND r.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.reactors r WHERE r.id = reactor_id AND r.user_id = auth.uid()));
NOTIFY pgrst, 'reload schema';
COMMIT;
