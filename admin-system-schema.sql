-- ============================================
-- SCRIPT SQL PARA SISTEMA DE ADMINISTRACIÓN
-- Estructura Jerárquica: Centro Educativo → Grado → Sección → Materia
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. TABLA DE CENTROS EDUCATIVOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.educational_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para educational_centers
CREATE INDEX IF NOT EXISTS idx_centers_name ON public.educational_centers(name);
CREATE INDEX IF NOT EXISTS idx_centers_active ON public.educational_centers(is_active);

-- RLS para educational_centers
ALTER TABLE public.educational_centers ENABLE ROW LEVEL SECURITY;

-- Política: Administradores pueden ver todos los centros
CREATE POLICY "Admins can view all centers" ON public.educational_centers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (
                auth.users.raw_user_meta_data->>'role' = 'admin'
                OR auth.users.raw_app_meta_data->>'role' = 'admin'
            )
        )
    );

-- Política: Administradores pueden crear centros
CREATE POLICY "Admins can create centers" ON public.educational_centers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (
                auth.users.raw_user_meta_data->>'role' = 'admin'
                OR auth.users.raw_app_meta_data->>'role' = 'admin'
            )
        )
    );

-- Política: Administradores pueden actualizar centros
CREATE POLICY "Admins can update centers" ON public.educational_centers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (
                auth.users.raw_user_meta_data->>'role' = 'admin'
                OR auth.users.raw_app_meta_data->>'role' = 'admin'
            )
        )
    );

-- Política: Administradores pueden eliminar centros
CREATE POLICY "Admins can delete centers" ON public.educational_centers
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (
                auth.users.raw_user_meta_data->>'role' = 'admin'
                OR auth.users.raw_app_meta_data->>'role' = 'admin'
            )
        )
    );


-- 2. TABLA DE GRADOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.grades_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID REFERENCES public.educational_centers(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- Ej: "1ro Primaria", "2do Secundaria"
    level INTEGER, -- Nivel numérico para ordenamiento
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(center_id, name)
);

-- Índices para grades_levels
CREATE INDEX IF NOT EXISTS idx_grades_center ON public.grades_levels(center_id);
CREATE INDEX IF NOT EXISTS idx_grades_level ON public.grades_levels(level);
CREATE INDEX IF NOT EXISTS idx_grades_active ON public.grades_levels(is_active);

-- RLS para grades_levels
ALTER TABLE public.grades_levels ENABLE ROW LEVEL SECURITY;

-- Política: Administradores pueden ver todos los grados
CREATE POLICY "Admins can view all grades" ON public.grades_levels
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (
                auth.users.raw_user_meta_data->>'role' = 'admin'
                OR auth.users.raw_app_meta_data->>'role' = 'admin'
            )
        )
    );

-- Política: Administradores pueden crear grados
CREATE POLICY "Admins can create grades" ON public.grades_levels
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (
                auth.users.raw_user_meta_data->>'role' = 'admin'
                OR auth.users.raw_app_meta_data->>'role' = 'admin'
            )
        )
    );

-- Política: Administradores pueden actualizar grados
CREATE POLICY "Admins can update grades" ON public.grades_levels
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (
                auth.users.raw_user_meta_data->>'role' = 'admin'
                OR auth.users.raw_app_meta_data->>'role' = 'admin'
            )
        )
    );

-- Política: Administradores pueden eliminar grados
CREATE POLICY "Admins can delete grades" ON public.grades_levels
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (
                auth.users.raw_user_meta_data->>'role' = 'admin'
                OR auth.users.raw_app_meta_data->>'role' = 'admin'
            )
        )
    );


-- 3. TABLA DE SECCIONES
-- ============================================
CREATE TABLE IF NOT EXISTS public.sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade_id UUID REFERENCES public.grades_levels(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- Ej: "A", "B", "C"
    max_students INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(grade_id, name)
);

-- Índices para sections
CREATE INDEX IF NOT EXISTS idx_sections_grade ON public.sections(grade_id);
CREATE INDEX IF NOT EXISTS idx_sections_active ON public.sections(is_active);

-- RLS para sections
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

-- Política: Administradores pueden ver todas las secciones
CREATE POLICY "Admins can view all sections" ON public.sections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (
                auth.users.raw_user_meta_data->>'role' = 'admin'
                OR auth.users.raw_app_meta_data->>'role' = 'admin'
            )
        )
    );

-- Política: Administradores pueden crear secciones
CREATE POLICY "Admins can create sections" ON public.sections
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (
                auth.users.raw_user_meta_data->>'role' = 'admin'
                OR auth.users.raw_app_meta_data->>'role' = 'admin'
            )
        )
    );

-- Política: Administradores pueden actualizar secciones
CREATE POLICY "Admins can update sections" ON public.sections
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (
                auth.users.raw_user_meta_data->>'role' = 'admin'
                OR auth.users.raw_app_meta_data->>'role' = 'admin'
            )
        )
    );

-- Política: Administradores pueden eliminar secciones
CREATE POLICY "Admins can delete sections" ON public.sections
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (
                auth.users.raw_user_meta_data->>'role' = 'admin'
                OR auth.users.raw_app_meta_data->>'role' = 'admin'
            )
        )
    );


-- 4. TABLA DE MATERIAS/ASIGNATURAS
-- ============================================
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- Ej: "Matemáticas", "Español"
    description TEXT,
    hours_per_week INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para subjects
CREATE INDEX IF NOT EXISTS idx_subjects_section ON public.subjects(section_id);
CREATE INDEX IF NOT EXISTS idx_subjects_name ON public.subjects(name);
CREATE INDEX IF NOT EXISTS idx_subjects_active ON public.subjects(is_active);

-- RLS para subjects
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Política: Administradores pueden ver todas las materias
CREATE POLICY "Admins can view all subjects" ON public.subjects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (
                auth.users.raw_user_meta_data->>'role' = 'admin'
                OR auth.users.raw_app_meta_data->>'role' = 'admin'
            )
        )
    );

-- Política: Administradores pueden crear materias
CREATE POLICY "Admins can create subjects" ON public.subjects
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (
                auth.users.raw_user_meta_data->>'role' = 'admin'
                OR auth.users.raw_app_meta_data->>'role' = 'admin'
            )
        )
    );

-- Política: Administradores pueden actualizar materias
CREATE POLICY "Admins can update subjects" ON public.subjects
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (
                auth.users.raw_user_meta_data->>'role' = 'admin'
                OR auth.users.raw_app_meta_data->>'role' = 'admin'
            )
        )
    );

-- Política: Administradores pueden eliminar materias
CREATE POLICY "Admins can delete subjects" ON public.subjects
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (
                auth.users.raw_user_meta_data->>'role' = 'admin'
                OR auth.users.raw_app_meta_data->>'role' = 'admin'
            )
        )
    );


-- 5. ACTUALIZAR TABLA DE USUARIOS (users)
-- ============================================
-- Agregar campos para la estructura jerárquica
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS center_id UUID REFERENCES public.educational_centers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS grade_id UUID REFERENCES public.grades_levels(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'student', -- 'admin', 'professor', 'student'
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active', -- 'active', 'suspended', 'inactive'
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS suspended_reason TEXT;

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_center ON public.users(center_id);
CREATE INDEX IF NOT EXISTS idx_users_grade ON public.users(grade_id);
CREATE INDEX IF NOT EXISTS idx_users_section ON public.users(section_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);


-- 6. TABLA DE ASIGNACIÓN PROFESOR-MATERIA
-- ============================================
CREATE TABLE IF NOT EXISTS public.professor_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(professor_id, subject_id)
);

-- Índices para professor_subjects
CREATE INDEX IF NOT EXISTS idx_prof_subjects_professor ON public.professor_subjects(professor_id);
CREATE INDEX IF NOT EXISTS idx_prof_subjects_subject ON public.professor_subjects(subject_id);

-- RLS para professor_subjects
ALTER TABLE public.professor_subjects ENABLE ROW LEVEL SECURITY;

-- Política: Administradores pueden ver todas las asignaciones
CREATE POLICY "Admins can view all assignments" ON public.professor_subjects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (
                auth.users.raw_user_meta_data->>'role' = 'admin'
                OR auth.users.raw_app_meta_data->>'role' = 'admin'
            )
        )
    );

-- Política: Administradores pueden crear asignaciones
CREATE POLICY "Admins can create assignments" ON public.professor_subjects
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (
                auth.users.raw_user_meta_data->>'role' = 'admin'
                OR auth.users.raw_app_meta_data->>'role' = 'admin'
            )
        )
    );


-- 7. FUNCIONES AUXILIARES
-- ============================================

-- Función para obtener la jerarquía completa de un usuario
CREATE OR REPLACE FUNCTION public.get_user_hierarchy(user_id UUID)
RETURNS TABLE(
    user_email VARCHAR,
    user_name VARCHAR,
    user_role VARCHAR,
    center_name VARCHAR,
    grade_name VARCHAR,
    section_name VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.email,
        u.full_name,
        u.role,
        ec.name as center_name,
        gl.name as grade_name,
        s.name as section_name
    FROM public.users u
    LEFT JOIN public.educational_centers ec ON u.center_id = ec.id
    LEFT JOIN public.grades_levels gl ON u.grade_id = gl.id
    LEFT JOIN public.sections s ON u.section_id = s.id
    WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para suspender un usuario
CREATE OR REPLACE FUNCTION public.suspend_user(
    user_id UUID,
    reason TEXT
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.users
    SET 
        status = 'suspended',
        suspended_at = NOW(),
        suspended_reason = reason,
        updated_at = NOW()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para reactivar un usuario
CREATE OR REPLACE FUNCTION public.reactivate_user(user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.users
    SET 
        status = 'active',
        suspended_at = NULL,
        suspended_reason = NULL,
        updated_at = NOW()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 8. TRIGGERS
-- ============================================

-- Trigger para actualizar updated_at en educational_centers
DROP TRIGGER IF EXISTS update_centers_updated_at ON public.educational_centers;
CREATE TRIGGER update_centers_updated_at
    BEFORE UPDATE ON public.educational_centers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para actualizar updated_at en grades_levels
DROP TRIGGER IF EXISTS update_grades_updated_at ON public.grades_levels;
CREATE TRIGGER update_grades_updated_at
    BEFORE UPDATE ON public.grades_levels
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para actualizar updated_at en sections
DROP TRIGGER IF EXISTS update_sections_updated_at ON public.sections;
CREATE TRIGGER update_sections_updated_at
    BEFORE UPDATE ON public.sections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para actualizar updated_at en subjects
DROP TRIGGER IF EXISTS update_subjects_updated_at ON public.subjects;
CREATE TRIGGER update_subjects_updated_at
    BEFORE UPDATE ON public.subjects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();


-- 9. DATOS INICIALES (OPCIONAL)
-- ============================================

-- Insertar centros educativos de ejemplo
INSERT INTO public.educational_centers (name, address, email) VALUES
    ('Colegio IPDC', 'Av. Principal 123', 'contacto@colegioipdc.com'),
    ('Instituto Bilingüe', 'Calle Secundaria 456', 'info@institutobilingue.com')
ON CONFLICT (name) DO NOTHING;

-- Obtener ID del Colegio IPDC
DO $$
DECLARE
    ipdc_id UUID;
BEGIN
    SELECT id INTO ipdc_id FROM public.educational_centers WHERE name = 'Colegio IPDC';
    
    -- Insertar grados para IPDC
    INSERT INTO public.grades_levels (center_id, name, level) VALUES
        (ipdc_id, '1ro Primaria', 1),
        (ipdc_id, '2do Primaria', 2),
        (ipdc_id, '3ro Primaria', 3),
        (ipdc_id, '1ro Secundaria', 7),
        (ipdc_id, '2do Secundaria', 8),
        (ipdc_id, '3ro Secundaria', 9)
    ON CONFLICT (center_id, name) DO NOTHING;
END $$;


-- 10. COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================
COMMENT ON TABLE public.educational_centers IS 'Centros educativos/escuelas';
COMMENT ON TABLE public.grades_levels IS 'Grados académicos dentro de cada centro';
COMMENT ON TABLE public.sections IS 'Secciones dentro de cada grado';
COMMENT ON TABLE public.subjects IS 'Materias/asignaturas por sección';
COMMENT ON TABLE public.professor_subjects IS 'Asignación de profesores a materias';


-- 11. VERIFICACIÓN
-- ============================================
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('educational_centers', 'grades_levels', 'sections', 'subjects', 'professor_subjects')
ORDER BY table_name;
