-- Solución alternativa: Usar el AdminPanel existente
-- Este script te ayudará a transferir los datos de users_temp a tu AdminPanel

-- 1. Crear función para obtener datos de users_temp en formato JSON
CREATE OR REPLACE FUNCTION public.get_temp_users_for_admin()
RETURNS TABLE(
    email TEXT,
    password TEXT,
    full_name TEXT,
    cohort TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ut.email::TEXT,
        ut.password::TEXT,
        (ut.firstname || ' ' || ut.lastname)::TEXT as full_name,
        ut.cohort1::TEXT as cohort
    FROM public.users_temp ut
    WHERE ut.email IS NOT NULL 
    AND ut.email != ''
    ORDER BY ut.email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Crear función para limpiar users_temp después del procesamiento
CREATE OR REPLACE FUNCTION public.cleanup_temp_users()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.users_temp;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Verificar cuántos usuarios tienes en temp
SELECT COUNT(*) as total_users FROM public.users_temp;

-- 4. Ver algunos ejemplos de los datos
SELECT 
    email,
    password,
    firstname || ' ' || lastname as full_name,
    cohort1 as cohort
FROM public.users_temp 
LIMIT 5;
