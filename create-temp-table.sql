-- Solución para importar CSV sin problemas de foreign key
-- Ejecutar este script en el SQL Editor de Supabase Dashboard

-- 1. Crear tabla temporal para importar el CSV
CREATE TABLE IF NOT EXISTS public.users_temp (
    username VARCHAR(255),
    password VARCHAR(255),
    firstname VARCHAR(255),
    lastname VARCHAR(255),
    email VARCHAR(255),
    cohort1 VARCHAR(50)
);

-- 2. Habilitar RLS en la tabla temporal
ALTER TABLE public.users_temp ENABLE ROW LEVEL SECURITY;

-- 3. Crear política para permitir inserción (solo para admins)
CREATE POLICY "Admins can insert temp users" ON public.users_temp
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email IN (
                'admin@epicgroup.com',  -- Reemplaza con tu email de admin
                'tu-email@ejemplo.com'  -- Agrega más emails de admin si necesitas
            )
        )
    );

-- 4. Crear política para permitir lectura (solo para admins)
CREATE POLICY "Admins can view temp users" ON public.users_temp
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

-- 5. Crear función para transferir datos de temp a users
CREATE OR REPLACE FUNCTION public.transfer_temp_users_to_auth()
RETURNS TABLE(
    success_count INTEGER,
    error_count INTEGER,
    errors TEXT[]
) AS $$
DECLARE
    temp_user RECORD;
    auth_result RECORD;
    success_counter INTEGER := 0;
    error_counter INTEGER := 0;
    error_messages TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Iterar sobre todos los usuarios temporales
    FOR temp_user IN SELECT * FROM public.users_temp LOOP
        BEGIN
            -- Intentar crear usuario en auth.users
            INSERT INTO auth.users (
                instance_id,
                id,
                aud,
                role,
                email,
                encrypted_password,
                email_confirmed_at,
                created_at,
                updated_at,
                raw_user_meta_data,
                raw_app_meta_data,
                is_super_admin,
                last_sign_in_at,
                app_metadata,
                user_metadata,
                identities,
                factors,
                aud_aud,
                role_role
            ) VALUES (
                '00000000-0000-0000-0000-000000000000',
                gen_random_uuid(),
                'authenticated',
                'authenticated',
                temp_user.email,
                crypt(temp_user.password, gen_salt('bf')),
                NOW(),
                NOW(),
                NOW(),
                jsonb_build_object(
                    'full_name', temp_user.firstname || ' ' || temp_user.lastname,
                    'cohort', temp_user.cohort1,
                    'username', temp_user.username,
                    'password', temp_user.password,
                    'firstname', temp_user.firstname,
                    'lastname', temp_user.lastname,
                    'cohort1', temp_user.cohort1
                ),
                '{}',
                false,
                NOW(),
                '{}',
                jsonb_build_object(
                    'full_name', temp_user.firstname || ' ' || temp_user.lastname,
                    'cohort', temp_user.cohort1,
                    'username', temp_user.username,
                    'password', temp_user.password,
                    'firstname', temp_user.firstname,
                    'lastname', temp_user.lastname,
                    'cohort1', temp_user.cohort1
                ),
                '[]',
                '[]',
                'authenticated',
                'authenticated'
            ) RETURNING * INTO auth_result;
            
            success_counter := success_counter + 1;
            
        EXCEPTION WHEN OTHERS THEN
            error_counter := error_counter + 1;
            error_messages := array_append(error_messages, 
                temp_user.email || ': ' || SQLERRM);
        END;
    END LOOP;
    
    -- Limpiar tabla temporal después del procesamiento
    DELETE FROM public.users_temp;
    
    RETURN QUERY SELECT success_counter, error_counter, error_messages;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Crear función más simple usando signUp (recomendada)
CREATE OR REPLACE FUNCTION public.create_users_from_temp()
RETURNS TABLE(
    success_count INTEGER,
    error_count INTEGER,
    errors TEXT[]
) AS $$
DECLARE
    temp_user RECORD;
    success_counter INTEGER := 0;
    error_counter INTEGER := 0;
    error_messages TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Iterar sobre todos los usuarios temporales
    FOR temp_user IN SELECT * FROM public.users_temp LOOP
        BEGIN
            -- Usar la función de Supabase para crear usuarios
            PERFORM auth.signup(
                temp_user.email,
                temp_user.password,
                jsonb_build_object(
                    'full_name', temp_user.firstname || ' ' || temp_user.lastname,
                    'cohort', temp_user.cohort1,
                    'username', temp_user.username,
                    'password', temp_user.password,
                    'firstname', temp_user.firstname,
                    'lastname', temp_user.lastname,
                    'cohort1', temp_user.cohort1
                )
            );
            
            success_counter := success_counter + 1;
            
        EXCEPTION WHEN OTHERS THEN
            error_counter := error_counter + 1;
            error_messages := array_append(error_messages, 
                temp_user.email || ': ' || SQLERRM);
        END;
    END LOOP;
    
    -- Limpiar tabla temporal después del procesamiento
    DELETE FROM public.users_temp;
    
    RETURN QUERY SELECT success_counter, error_counter, error_messages;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Comentarios para documentación
COMMENT ON TABLE public.users_temp IS 'Tabla temporal para importar CSV de usuarios';
COMMENT ON FUNCTION public.transfer_temp_users_to_auth() IS 'Transfiere usuarios de temp a auth.users (método directo)';
COMMENT ON FUNCTION public.create_users_from_temp() IS 'Crea usuarios usando auth.signup (método recomendado)';

-- 8. Verificar que la tabla temporal se creó correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users_temp' 
AND table_schema = 'public'
ORDER BY ordinal_position;
