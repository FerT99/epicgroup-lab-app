-- Script SQL para insertar usuarios del Colegio IPDC en Supabase
-- Este script inserta usuarios en la tabla auth.users de Supabase

-- IMPORTANTE: Ejecutar este script en el SQL Editor de Supabase Dashboard
-- o usar la función auth.signUp() desde el código de la aplicación

-- Opción 1: Inserción directa en auth.users (requiere permisos de administrador)
-- NOTA: Esta opción puede requerir configuración especial de Supabase

INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES 
-- Usuarios IPDC1
('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'pdc-01180137@colegiosingles.com', crypt('ingles2025', gen_salt('bf')), NOW(), NULL, NULL, '{"provider":"email","providers":["email"]}', '{"full_name":"ENRIQUE RAMOS VALERIO","cohort":"IPDC1"}', NOW(), NOW(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'pdc-09170434@colegiosingles.com', crypt('ingles2025', gen_salt('bf')), NOW(), NULL, NULL, '{"provider":"email","providers":["email"]}', '{"full_name":"MAXIMO TADEO FARIAS SANCHEZ","cohort":"IPDC1"}', NOW(), NOW(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'pdc-08231416@colegiosingles.com', crypt('ingles2025', gen_salt('bf')), NOW(), NULL, NULL, '{"provider":"email","providers":["email"]}', '{"full_name":"FABIAN SAEZ ESCOBAR","cohort":"IPDC1"}', NOW(), NOW(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'pdc-09170273@colegiosingles.com', crypt('ingles2025', gen_salt('bf')), NOW(), NULL, NULL, '{"provider":"email","providers":["email"]}', '{"full_name":"ERIKA ORTIZ RIOJAS","cohort":"IPDC1"}', NOW(), NOW(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'pdc-09210775@colegiosingles.com', crypt('ingles2025', gen_salt('bf')), NOW(), NULL, NULL, '{"provider":"email","providers":["email"]}', '{"full_name":"PABLO SANTIAGO FARIAS LOZANO","cohort":"IPDC1"}', NOW(), NOW(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'pdc-09170171@colegiosingles.com', crypt('ingles2025', gen_salt('bf')), NOW(), NULL, NULL, '{"provider":"email","providers":["email"]}', '{"full_name":"MIA AMELIE RAMIREZ HERMANN","cohort":"IPDC1"}', NOW(), NOW(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'pdc-01231206@colegiosingles.com', crypt('ingles2025', gen_salt('bf')), NOW(), NULL, NULL, '{"provider":"email","providers":["email"]}', '{"full_name":"REGINA IGLESIAS SOLANO","cohort":"IPDC1"}', NOW(), NOW(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'pdc-03231298@colegiosingles.com', crypt('ingles2025', gen_salt('bf')), NOW(), NULL, NULL, '{"provider":"email","providers":["email"]}', '{"full_name":"DENISSE DANIELA CHAVEZ LOPEZ","cohort":"IPDC1"}', NOW(), NOW(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'pdc-02231227@colegiosingles.com', crypt('ingles2025', gen_salt('bf')), NOW(), NULL, NULL, '{"provider":"email","providers":["email"]}', '{"full_name":"ROSA VICTORIA PEREZ FAUTRÉ","cohort":"IPDC1"}', NOW(), NOW(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'pdc-07231395@colegiosingles.com', crypt('ingles2025', gen_salt('bf')), NOW(), NULL, NULL, '{"provider":"email","providers":["email"]}', '{"full_name":"EMILIANO VALLEJO FLORES","cohort":"IPDC1"}', NOW(), NOW(), '', '', '', '');

-- Continuar con más usuarios...
-- NOTA: Este es solo un ejemplo con los primeros 10 usuarios
-- Para insertar todos los usuarios, necesitarías continuar con el mismo patrón
