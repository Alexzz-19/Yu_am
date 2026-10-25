-- Aplicar después del esquema base. Las notas se incorporan con SQL Editor o
-- procesos de administración; el navegador solo puede leerlas con sesión activa.
BEGIN;

CREATE TABLE IF NOT EXISTS public.boveda_memoria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL CHECK (length(trim(titulo)) BETWEEN 1 AND 200),
  contenido TEXT NOT NULL CHECK (length(trim(contenido)) BETWEEN 1 AND 20000),
  etiquetas TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.boveda_memoria ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.boveda_memoria FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.boveda_memoria TO authenticated;

DROP POLICY IF EXISTS "YUAM notas visibles a usuarios autenticados" ON public.boveda_memoria;
CREATE POLICY "YUAM notas visibles a usuarios autenticados"
  ON public.boveda_memoria FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

COMMIT;
