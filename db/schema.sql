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
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Tabla de Perfiles de Usuario (Extensión de auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.perfiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre_completo VARCHAR(150) NOT NULL,
    avatar_id INT REFERENCES public.avatares(id),
    rol VARCHAR(50) DEFAULT 'investigador' CHECK (rol in ('investigador', 'admin', 'invitado')),
    api_keys_count INT DEFAULT 1 CHECK (api_keys_count <= 4),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Tabla de Nodos IoT (Dispositivos ESP32 con Sensor MQ-135)
CREATE TABLE IF NOT EXISTS public.nodos_iot (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE,
    nombre_nodo VARCHAR(100) NOT NULL,
    avatar_id INT REFERENCES public.avatares(id),
    ubicacion_ofuscada JSONB NOT NULL, -- Privacidad Privacy-by-Design (lat/lng ofuscadas)
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'mantenimiento')),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Tabla de Telemetría (Lecturas del sensor MQ-135 y variables ambientales)
CREATE TABLE IF NOT EXISTS public.telemetria_mq135 (
    id BIGSERIAL PRIMARY KEY,
    nodo_id UUID REFERENCES public.nodos_iot(id) ON DELETE CASCADE,
    ppm_co2 NUMERIC(10, 2),
    calidad_aire NUMERIC(10, 2),
    temperatura NUMERIC(5, 2),
    humedad NUMERIC(5, 2),
    bifer_local BOOLEAN DEFAULT FALSE, -- Indicador si dato provino de búfer por falla de red
    registrado_en TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- Índices para optimización de consultas en tiempo real
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_telemetria_nodo_tiempo ON public.telemetria_mq135(nodo_id, registrado_en DESC);
CREATE INDEX IF NOT EXISTS idx_nodos_usuario ON public.nodos_iot(usuario_id);

-- ============================================================================
-- Habilitar Row Level Security (RLS)
-- ============================================================================
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nodos_iot ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetria_mq135 ENABLE ROW LEVEL SECURITY;
