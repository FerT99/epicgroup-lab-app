-- ============================================
-- SCRIPT PARA CREAR USUARIOS DE PRUEBA
-- Versión sin ON CONFLICT
-- ============================================

-- PASO 1: Eliminar usuarios existentes si existen
DELETE FROM public.users WHERE email IN ('admin@test.com', 'profesor@test.com');

-- PASO 2: Crear usuario administrador
INSERT INTO public.users (
    id,
    email,
    full_name,
    firstname,
    lastname,
    role,
    status,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'admin@test.com',
    'Administrador Test',
    'Administrador',
    'Test',
    'admin',
    'active',
    NOW(),
    NOW()
);

-- PASO 3: Crear usuario profesor
INSERT INTO public.users (
    id,
    email,
    full_name,
    firstname,
    lastname,
    role,
    status,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'profesor@test.com',
    'Profesor Test',
    'Profesor',
    'Test',
    'professor',
    'active',
    NOW(),
    NOW()
);

-- PASO 4: Crear centro educativo si no existe
INSERT INTO public.educational_centers (name, address, email, is_active)
SELECT 'Colegio IPDC', 'Av. Principal 123', 'contacto@colegioipdc.com', true
WHERE NOT EXISTS (
    SELECT 1 FROM public.educational_centers WHERE name = 'Colegio IPDC'
);

-- PASO 5: Asignar centro al profesor
UPDATE public.users
SET center_id = (SELECT id FROM public.educational_centers WHERE name = 'Colegio IPDC' LIMIT 1)
WHERE email = 'profesor@test.com';

-- PASO 6: Verificación
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.status,
    ec.name as centro_educativo,
    u.created_at
FROM public.users u
LEFT JOIN public.educational_centers ec ON u.center_id = ec.id
WHERE u.email IN ('admin@test.com', 'profesor@test.com')
ORDER BY u.role DESC;

-- ============================================
-- SIGUIENTE PASO: CREAR CUENTAS DE AUTENTICACIÓN
-- ============================================

/*
✅ Los perfiles de usuario ya están creados en public.users

⚠️ AHORA DEBES CREAR LAS CUENTAS EN SUPABASE AUTH:

1. Ve a tu proyecto Supabase Dashboard
2. Navega a: Authentication → Users
3. Click en "Add user" → "Create new user"
4. Crea estos dos usuarios:

   👨‍💼 ADMINISTRADOR:
      Email: admin@test.com
      Password: admin123
      ✓ Confirm email: SÍ
      
   👨‍🏫 PROFESOR:
      Email: profesor@test.com
      Password: profesor123
      ✓ Confirm email: SÍ

5. ¡Listo! Ya puedes iniciar sesión con estos usuarios

NOTA: Los perfiles en public.users se vincularán automáticamente
con las cuentas de auth.users por el campo email.
*/
