-- ============================================
-- SCRIPT SQL PARA SISTEMA DE PROGRESO DE ALUMNOS
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. TABLA DE CURSOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    professor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    color VARCHAR(50) DEFAULT 'purple', -- purple, orange, lime, blue
    total_steps INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para courses
CREATE INDEX IF NOT EXISTS idx_courses_professor ON public.courses(professor_id);
CREATE INDEX IF NOT EXISTS idx_courses_created ON public.courses(created_at);

-- RLS para courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Política: Profesores pueden ver sus propios cursos
CREATE POLICY "Professors can view their courses" ON public.courses
    FOR SELECT USING (
        auth.uid() = professor_id
    );

-- Política: Alumnos pueden ver cursos en los que están inscritos
CREATE POLICY "Students can view enrolled courses" ON public.courses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.enrollments
            WHERE enrollments.course_id = courses.id
            AND enrollments.student_id = auth.uid()
        )
    );

-- Política: Profesores pueden crear cursos
CREATE POLICY "Professors can create courses" ON public.courses
    FOR INSERT WITH CHECK (
        auth.uid() = professor_id
    );

-- Política: Profesores pueden actualizar sus cursos
CREATE POLICY "Professors can update their courses" ON public.courses
    FOR UPDATE USING (
        auth.uid() = professor_id
    );

-- Política: Profesores pueden eliminar sus cursos
CREATE POLICY "Professors can delete their courses" ON public.courses
    FOR DELETE USING (
        auth.uid() = professor_id
    );


-- 2. TABLA DE INSCRIPCIONES (ENROLLMENTS)
-- ============================================
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    completed_steps INTEGER DEFAULT 0,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, student_id)
);

-- Índices para enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_progress ON public.enrollments(progress);

-- RLS para enrollments
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Política: Alumnos pueden ver sus propias inscripciones
CREATE POLICY "Students can view their enrollments" ON public.enrollments
    FOR SELECT USING (
        auth.uid() = student_id
    );

-- Política: Profesores pueden ver inscripciones de sus cursos
CREATE POLICY "Professors can view course enrollments" ON public.enrollments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.courses
            WHERE courses.id = enrollments.course_id
            AND courses.professor_id = auth.uid()
        )
    );

-- Política: Profesores pueden crear inscripciones en sus cursos
CREATE POLICY "Professors can create enrollments" ON public.enrollments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.courses
            WHERE courses.id = course_id
            AND courses.professor_id = auth.uid()
        )
    );

-- Política: Profesores pueden actualizar inscripciones de sus cursos
CREATE POLICY "Professors can update enrollments" ON public.enrollments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.courses
            WHERE courses.id = enrollments.course_id
            AND courses.professor_id = auth.uid()
        )
    );


-- 3. TABLA DE CALIFICACIONES (GRADES)
-- ============================================
CREATE TABLE IF NOT EXISTS public.grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_name VARCHAR(255) NOT NULL,
    grade DECIMAL(5,2) NOT NULL CHECK (grade >= 0),
    max_grade DECIMAL(5,2) NOT NULL DEFAULT 100 CHECK (max_grade > 0),
    assignment_name VARCHAR(255),
    notes TEXT,
    graded_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para grades
CREATE INDEX IF NOT EXISTS idx_grades_enrollment ON public.grades(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_grades_student ON public.grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_course ON public.grades(course_id);
CREATE INDEX IF NOT EXISTS idx_grades_created ON public.grades(created_at);

-- RLS para grades
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- Política: Alumnos pueden ver sus propias calificaciones
CREATE POLICY "Students can view their grades" ON public.grades
    FOR SELECT USING (
        auth.uid() = student_id
    );

-- Política: Profesores pueden ver calificaciones de sus cursos
CREATE POLICY "Professors can view course grades" ON public.grades
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.courses
            WHERE courses.id = grades.course_id
            AND courses.professor_id = auth.uid()
        )
    );

-- Política: Profesores pueden crear calificaciones en sus cursos
CREATE POLICY "Professors can create grades" ON public.grades
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.courses
            WHERE courses.id = course_id
            AND courses.professor_id = auth.uid()
        )
    );

-- Política: Profesores pueden actualizar calificaciones de sus cursos
CREATE POLICY "Professors can update grades" ON public.grades
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.courses
            WHERE courses.id = grades.course_id
            AND courses.professor_id = auth.uid()
        )
    );

-- Política: Profesores pueden eliminar calificaciones de sus cursos
CREATE POLICY "Professors can delete grades" ON public.grades
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.courses
            WHERE courses.id = grades.course_id
            AND courses.professor_id = auth.uid()
        )
    );


-- 4. TABLA DE COMENTARIOS DE ESTUDIANTES
-- ============================================
CREATE TABLE IF NOT EXISTS public.student_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    professor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para student_comments
CREATE INDEX IF NOT EXISTS idx_comments_student ON public.student_comments(student_id);
CREATE INDEX IF NOT EXISTS idx_comments_professor ON public.student_comments(professor_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON public.student_comments(created_at DESC);

-- RLS para student_comments
ALTER TABLE public.student_comments ENABLE ROW LEVEL SECURITY;

-- Política: Alumnos pueden ver comentarios sobre ellos
CREATE POLICY "Students can view their comments" ON public.student_comments
    FOR SELECT USING (
        auth.uid() = student_id
    );

-- Política: Profesores pueden ver sus propios comentarios
CREATE POLICY "Professors can view their comments" ON public.student_comments
    FOR SELECT USING (
        auth.uid() = professor_id
    );

-- Política: Profesores pueden crear comentarios
CREATE POLICY "Professors can create comments" ON public.student_comments
    FOR INSERT WITH CHECK (
        auth.uid() = professor_id
    );

-- Política: Profesores pueden actualizar sus comentarios
CREATE POLICY "Professors can update their comments" ON public.student_comments
    FOR UPDATE USING (
        auth.uid() = professor_id
    );

-- Política: Profesores pueden eliminar sus comentarios
CREATE POLICY "Professors can delete their comments" ON public.student_comments
    FOR DELETE USING (
        auth.uid() = professor_id
    );


-- 5. FUNCIONES AUXILIARES
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_courses_updated_at ON public.courses;
CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_enrollments_updated_at ON public.enrollments;
CREATE TRIGGER update_enrollments_updated_at
    BEFORE UPDATE ON public.enrollments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_grades_updated_at ON public.grades;
CREATE TRIGGER update_grades_updated_at
    BEFORE UPDATE ON public.grades
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON public.student_comments;
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON public.student_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();


-- 6. VISTA PARA PROGRESO DE ESTUDIANTES
-- ============================================
CREATE OR REPLACE VIEW public.student_progress_view AS
SELECT 
    e.student_id,
    e.course_id,
    c.name as course_name,
    c.color as course_color,
    e.progress,
    e.completed_steps,
    c.total_steps,
    AVG(g.grade / g.max_grade * 100) as average_grade,
    COUNT(DISTINCT g.id) as total_grades,
    COUNT(DISTINCT sc.id) as total_comments
FROM public.enrollments e
LEFT JOIN public.courses c ON e.course_id = c.id
LEFT JOIN public.grades g ON g.enrollment_id = e.id
LEFT JOIN public.student_comments sc ON sc.student_id = e.student_id
GROUP BY e.student_id, e.course_id, c.name, c.color, e.progress, e.completed_steps, c.total_steps;


-- 7. COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================
COMMENT ON TABLE public.courses IS 'Tabla de cursos creados por profesores';
COMMENT ON TABLE public.enrollments IS 'Inscripciones de estudiantes a cursos';
COMMENT ON TABLE public.grades IS 'Calificaciones de estudiantes en cursos';
COMMENT ON TABLE public.student_comments IS 'Comentarios de profesores sobre estudiantes';
COMMENT ON VIEW public.student_progress_view IS 'Vista consolidada del progreso de estudiantes';


-- 8. VERIFICACIÓN
-- ============================================
-- Verificar que todas las tablas se crearon correctamente
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('courses', 'enrollments', 'grades', 'student_comments')
ORDER BY table_name;

-- Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('courses', 'enrollments', 'grades', 'student_comments')
ORDER BY tablename, policyname;
