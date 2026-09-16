-- ============================================================================
-- YU'AM v2.0 - Esquema Base de Datos Supabase (PostgreSQL)
-- ============================================================================

-- 1. Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla de Avatares (Catálogo de 35 avatares: 30 estándar + 5 desbloqueables)
CREATE TABLE IF NOT EXISTS public.avatares (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('estandar', 'desbloqueable')),
    url_imagen TEXT NOT NULL,
    requisito_desbloqueo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Tabla de Perfiles de Usuario (Extensión de auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.perfiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre_completo VARCHAR(150) NOT NULL,
    avatar_id INT REFERENCES public.avatares(id),
    rol VARCHAR(50) DEFAULT 'investigador' CHECK (rol in ('investigador', 'admin', 'invitado')),
    api_keys_count INT DEFAULT 1 CHECK (api_keys_count <= 4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Tabla de Nodos IoT (Dispositivos ESP32 con Sensor MQ-135)
CREATE TABLE IF NOT EXISTS public.nodos_iot (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE,
    nombre_nodo VARCHAR(100) NOT NULL,
    avatar_id INT REFERENCES public.avatares(id),
    ubicacion_ofuscada JSONB NOT NULL, -- Privacidad Privacy-by-Design (lat/lng ofuscadas)
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'mantenimiento')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Tabla de Telemetría (Lecturas del sensor MQ-135 y variables ambientales)
CREATE TABLE IF NOT EXISTS public.telemetria_mq135 (
    id BIGSERIAL PRIMARY KEY,
    nodo_id UUID REFERENCES public.nodos_iot(id) ON DELETE CASCADE,
    ppm_co2 NUMERIC(10, 2),
    calidad_aire NUMERIC(10, 2),
    temperatura NUMERIC(5, 2),
    humedad NUMERIC(5, 2),
    bufer_local BOOLEAN DEFAULT FALSE, -- Indicador si dato provino de búfer por falla de red
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- Índices para optimización de consultas en tiempo real
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_telemetria_nodo_tiempo ON public.telemetria_mq135(nodo_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nodos_usuario ON public.nodos_iot(usuario_id);

-- ============================================================================
-- Habilitar Row Level Security (RLS)
-- ============================================================================
ALTER TABLE public.avatares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nodos_iot ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetria_mq135 ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Políticas RLS (Row Level Security)
-- ============================================================================

-- Avatares: Lectura pública para todos los usuarios
CREATE POLICY "Avatares visibles para todos" ON public.avatares
    FOR SELECT USING (true);

-- Perfiles: Cada usuario puede ver y editar su propio perfil
CREATE POLICY "Perfiles visibles por usuarios autenticados" ON public.perfiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON public.perfiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden insertar su propio perfil" ON public.perfiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Nodos IoT: Gestión exclusiva del usuario propietario
CREATE POLICY "Usuarios gestionan sus propios nodos" ON public.nodos_iot
    FOR ALL USING (auth.uid() = usuario_id)
    WITH CHECK (auth.uid() = usuario_id);

-- Telemetría MQ-135: Lectura e inserción para nodos del usuario propietario
CREATE POLICY "Telemetría accesible por el propietario del nodo" ON public.telemetria_mq135
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.nodos_iot
            WHERE nodos_iot.id = telemetria_mq135.nodo_id
            AND nodos_iot.usuario_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.nodos_iot
            WHERE nodos_iot.id = telemetria_mq135.nodo_id
            AND nodos_iot.usuario_id = auth.uid()
        )
    );
