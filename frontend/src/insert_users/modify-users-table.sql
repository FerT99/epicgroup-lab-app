-- Consulta SQL para modificar la tabla users con las columnas del CSV
-- Ejecutar este script en el SQL Editor de Supabase Dashboard

-- 1. Agregar las columnas faltantes a la tabla users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS username VARCHAR(255),
ADD COLUMN IF NOT EXISTS password VARCHAR(255),
ADD COLUMN IF NOT EXISTS firstname VARCHAR(255),
ADD COLUMN IF NOT EXISTS lastname VARCHAR(255),
ADD COLUMN IF NOT EXISTS cohort1 VARCHAR(50);

-- 2. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_firstname ON public.users(firstname);
CREATE INDEX IF NOT EXISTS idx_users_lastname ON public.users(lastname);
CREATE INDEX IF NOT EXISTS idx_users_cohort1 ON public.users(cohort1);

-- 3. Actualizar la función de sincronización para incluir las nuevas columnas
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id,
        email,
        full_name,
        cohort,
        avatar_url,
        username,
        password,
        firstname,
        lastname,
        cohort1,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'cohort', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        COALESCE(NEW.raw_user_meta_data->>'username', ''),
        COALESCE(NEW.raw_user_meta_data->>'password', ''),
        COALESCE(NEW.raw_user_meta_data->>'firstname', ''),
        COALESCE(NEW.raw_user_meta_data->>'lastname', ''),
        COALESCE(NEW.raw_user_meta_data->>'cohort1', ''),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
        cohort = COALESCE(EXCLUDED.cohort, public.users.cohort),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
        username = COALESCE(EXCLUDED.username, public.users.username),
        password = COALESCE(EXCLUDED.password, public.users.password),
        firstname = COALESCE(EXCLUDED.firstname, public.users.firstname),
        lastname = COALESCE(EXCLUDED.lastname, public.users.lastname),
        cohort1 = COALESCE(EXCLUDED.cohort1, public.users.cohort1),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Actualizar la función de actualización de usuarios
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users SET
        email = NEW.email,
        full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', public.users.full_name),
        cohort = COALESCE(NEW.raw_user_meta_data->>'cohort', public.users.cohort),
        avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', public.users.avatar_url),
        username = COALESCE(NEW.raw_user_meta_data->>'username', public.users.username),
        password = COALESCE(NEW.raw_user_meta_data->>'password', public.users.password),
        firstname = COALESCE(NEW.raw_user_meta_data->>'firstname', public.users.firstname),
        lastname = COALESCE(NEW.raw_user_meta_data->>'lastname', public.users.lastname),
        cohort1 = COALESCE(NEW.raw_user_meta_data->>'cohort1', public.users.cohort1),
        updated_at = NOW()
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Actualizar usuarios existentes con datos del CSV (opcional)
-- Si ya tienes usuarios, puedes ejecutar esto para sincronizar los datos:
UPDATE public.users SET
    username = COALESCE(raw_user_meta_data->>'username', ''),
    password = COALESCE(raw_user_meta_data->>'password', ''),
    firstname = COALESCE(raw_user_meta_data->>'firstname', ''),
    lastname = COALESCE(raw_user_meta_data->>'lastname', ''),
    cohort1 = COALESCE(raw_user_meta_data->>'cohort1', ''),
    updated_at = NOW()
WHERE id IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data IS NOT NULL
);

-- 6. Comentarios para documentación
COMMENT ON COLUMN public.users.username IS 'Nombre de usuario del CSV';
COMMENT ON COLUMN public.users.password IS 'Contraseña del CSV';
COMMENT ON COLUMN public.users.firstname IS 'Nombre del CSV';
COMMENT ON COLUMN public.users.lastname IS 'Apellido del CSV';
COMMENT ON COLUMN public.users.cohort1 IS 'Cohorte del CSV (IPDC1, IPDC3, IPDC5)';

-- 7. Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;
