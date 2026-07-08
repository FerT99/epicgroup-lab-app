const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createMockCourse() {
    try {
        console.log('Iniciando creación de curso mock...');

        // 1. Create Center
        const { data: center, error: centerErr } = await supabase
            .from('centers')
            .insert([{ name: 'Centro Espacial de Pruebas', short_name: 'CEP' }])
            .select()
            .single();
        if (centerErr) throw centerErr;
        console.log('✅ Centro creado:', center.name);

        // 2. Create Grade
        const { data: grade, error: gradeErr } = await supabase
            .from('grades')
            .insert([{ name: 'Primer Año Intergaláctico', center_id: center.id }])
            .select()
            .single();
        if (gradeErr) throw gradeErr;
        console.log('✅ Grado creado:', grade.name);

        // 3. Create Subject
        const { data: subject, error: subErr } = await supabase
            .from('subjects')
            .insert([{ name: 'Astronomía 101', short_name: 'AST-101', grade_id: grade.id }])
            .select()
            .single();
        if (subErr) throw subErr;
        console.log('✅ Materia creada:', subject.name);

        // 4. Get all users
        const { data: users, error: usersErr } = await supabase
            .from('users')
            .select('id, role, full_name, email');
        if (usersErr) throw usersErr;
        
        console.log(`Se encontraron ${users.length} usuarios. Asignando clases...`);

        let profCount = 0;
        let studentCount = 0;

        for (const user of users) {
            if (user.role === 'professor' || user.role === 'admin') {
                // Add to professor_subjects
                const { error: spErr } = await supabase
                    .from('professor_subjects')
                    .insert([{ subject_id: subject.id, professor_id: user.id }]);
                
                // Ignore duplicates if they already have one, but here it's a new subject anyway
                if (spErr && spErr.code !== '23505') console.error('Error asignando prof:', spErr.message);
                else profCount++;
            } else if (user.role === 'student') {
                // Add to enrollments
                const { error: enErr } = await supabase
                    .from('enrollments')
                    .insert([{ 
                        student_id: user.id, 
                        center_id: center.id,
                        grade_id: grade.id,
                        subject_id: subject.id,
                        status: 'active'
                    }]);
                
                if (enErr && enErr.code !== '23505') console.error('Error asignando alumno:', enErr.message);
                else studentCount++;
            }
        }

        console.log(`✅ ¡Curso Mock creado con éxito! Asignado a ${profCount} profesores/admins y ${studentCount} alumnos.`);
    } catch (e) {
        console.error('Error:', e);
    }
}

createMockCourse();
