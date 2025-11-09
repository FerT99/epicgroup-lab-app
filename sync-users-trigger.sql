-- Script SQL para sincronizar automáticamente auth.users con public.users
-- Ejecutar este script en el SQL Editor de Supabase Dashboard

-- 1. Crear la tabla users en el esquema público (si no existe)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name TEXT,
    cohort TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS (Row Level Security) en la tabla
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas de seguridad
-- Los usuarios pueden ver y editar solo su propio perfil
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Los administradores pueden ver todos los usuarios
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email IN (
                'admin@epicgroup.com',  -- Reemplaza con tu email de admin
                'tu-email@ejemplo.com'  -- Agrega más emails de admin si necesitas
            )
        )
    );

-- 4. Crear función para sincronizar usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id,
        email,
        full_name,
        cohort,
        avatar_url,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'cohort', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
        cohort = COALESCE(EXCLUDED.cohort, public.users.cohort),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Crear función para actualizar usuarios existentes
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users SET
        email = NEW.email,
        full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', public.users.full_name),
        cohort = COALESCE(NEW.raw_user_meta_data->>'cohort', public.users.cohort),
        avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', public.users.avatar_url),
        updated_at = NOW()
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Crear función para eliminar usuarios
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.users WHERE id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Crear triggers
-- Trigger para nuevos usuarios
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para actualizaciones de usuarios
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Trigger para eliminación de usuarios
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
    AFTER DELETE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();

-- 8. Sincronizar usuarios existentes (opcional)
-- Si ya tienes usuarios en auth.users, ejecuta esto para sincronizarlos:
INSERT INTO public.users (
    id,
    email,
    full_name,
    cohort,
    avatar_url,
    created_at,
    updated_at
)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', ''),
    COALESCE(raw_user_meta_data->>'cohort', ''),
    COALESCE(raw_user_meta_data->>'avatar_url', ''),
    created_at,
    updated_at
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    cohort = COALESCE(EXCLUDED.cohort, public.users.cohort),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
    updated_at = NOW();

-- 9. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_cohort ON public.users(cohort);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- 10. Comentarios para documentación
COMMENT ON TABLE public.users IS 'Tabla de usuarios sincronizada con auth.users';
COMMENT ON COLUMN public.users.id IS 'ID del usuario (referencia a auth.users)';
COMMENT ON COLUMN public.users.email IS 'Email del usuario';
COMMENT ON COLUMN public.users.full_name IS 'Nombre completo del usuario';
COMMENT ON COLUMN public.users.cohort IS 'Cohorte del usuario (IPDC1, IPDC3, IPDC5)';
COMMENT ON COLUMN public.users.avatar_url IS 'URL del avatar del usuario';
COMMENT ON COLUMN public.users.created_at IS 'Fecha de creación del usuario';
COMMENT ON COLUMN public.users.updated_at IS 'Fecha de última actualización del usuario';
