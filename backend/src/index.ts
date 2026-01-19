import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || ''; // Use Service Key for Backend
export const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================
// STUDENT PROGRESS ENDPOINTS
// ============================================

// Get student progress by student ID
app.get('/api/students/:studentId/progress', async (req, res) => {
    try {
        const { studentId } = req.params;

        // Get student basic info
        const { data: student, error: studentError } = await supabase
            .from('users')
            .select('id, email, full_name, firstname, lastname, avatar_url')
            .eq('id', studentId)
            .single();

        if (studentError) throw studentError;

        // Get enrollments with course info
        const { data: enrollments, error: enrollmentsError } = await supabase
            .from('enrollments')
            .select(`
                id,
                progress,
                completed_steps,
                course_id,
                courses (
                    id,
                    name,
                    color,
                    total_steps
                )
            `)
            .eq('student_id', studentId);

        if (enrollmentsError) throw enrollmentsError;

        // Get grades
        const { data: grades, error: gradesError } = await supabase
            .from('grades')
            .select('id, course_name, grade, max_grade, assignment_name, graded_at')
            .eq('student_id', studentId)
            .order('graded_at', { ascending: false });

        if (gradesError) throw gradesError;

        // Get comments
        const { data: comments, error: commentsError } = await supabase
            .from('student_comments')
            .select('id, text, author_name, created_at, updated_at')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false });

        if (commentsError) throw commentsError;

        // Format response
        const studentData = {
            id: student.id,
            name: student.full_name || `${student.firstname || ''} ${student.lastname || ''}`.trim() || 'Alumno',
            email: student.email,
            avatar: student.avatar_url,
            courses: enrollments?.map(e => {
                const course = e.courses as any; // Type assertion for nested Supabase relation
                return {
                    id: course.id,
                    name: course.name,
                    progress: e.progress || 0,
                    color: course.color || 'purple'
                };
            }) || [],
            grades: grades?.map(g => ({
                courseName: g.course_name,
                grade: g.grade,
                maxGrade: g.max_grade,
                assignmentName: g.assignment_name,
                gradedAt: g.graded_at
            })) || [],
            comments: comments?.map(c => ({
                id: c.id,
                text: c.text,
                author: c.author_name,
                date: new Date(c.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })
            })) || []
        };

        res.json(studentData);
    } catch (error: any) {
        console.error('Error fetching student progress:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all students for a professor
app.get('/api/students', async (req, res) => {
    try {
        const { professorId } = req.query;

        if (!professorId) {
            return res.status(400).json({ error: 'Professor ID is required' });
        }

        // Get all students enrolled in professor's courses
        const { data: enrollments, error: enrollmentsError } = await supabase
            .from('enrollments')
            .select(`
                student_id,
                courses!inner (
                    professor_id
                )
            `)
            .eq('courses.professor_id', professorId);

        if (enrollmentsError) throw enrollmentsError;

        // Get unique student IDs
        const studentIds = [...new Set(enrollments?.map(e => e.student_id) || [])];

        if (studentIds.length === 0) {
            return res.json([]);
        }

        // Get student details
        const { data: students, error: studentsError } = await supabase
            .from('users')
            .select('id, email, full_name, firstname, lastname, avatar_url')
            .in('id', studentIds);

        if (studentsError) throw studentsError;

        const formattedStudents = students?.map((student, index) => ({
            id: index + 1,
            userId: student.id,
            name: student.full_name || `${student.firstname || ''} ${student.lastname || ''}`.trim() || 'Alumno',
            email: student.email,
            description: student.email,
            color: ['orange', 'salmon'][index % 2] // Alternate colors
        })) || [];

        res.json(formattedStudents);
    } catch (error: any) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add comment to student
app.post('/api/students/:studentId/comments', async (req, res) => {
    try {
        const { studentId } = req.params;
        const { text, professorId, authorName } = req.body;

        if (!text || !professorId || !authorName) {
            return res.status(400).json({ error: 'Text, professorId, and authorName are required' });
        }

        const { data, error } = await supabase
            .from('student_comments')
            .insert({
                student_id: studentId,
                professor_id: professorId,
                text,
                author_name: authorName
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            id: data.id,
            text: data.text,
            author: data.author_name,
            date: new Date(data.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        });
    } catch (error: any) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update comment
app.put('/api/comments/:commentId', async (req, res) => {
    try {
        const { commentId } = req.params;
        const { text, professorId } = req.body;

        if (!text || !professorId) {
            return res.status(400).json({ error: 'Text and professorId are required' });
        }

        // Verify professor owns the comment
        const { data: comment, error: checkError } = await supabase
            .from('student_comments')
            .select('professor_id')
            .eq('id', commentId)
            .single();

        if (checkError) throw checkError;

        if (comment.professor_id !== professorId) {
            return res.status(403).json({ error: 'Unauthorized to edit this comment' });
        }

        const { data, error } = await supabase
            .from('student_comments')
            .update({ text })
            .eq('id', commentId)
            .select()
            .single();

        if (error) throw error;

        res.json({
            id: data.id,
            text: data.text,
            author: data.author_name,
            date: new Date(data.updated_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        });
    } catch (error: any) {
        console.error('Error updating comment:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete comment
app.delete('/api/comments/:commentId', async (req, res) => {
    try {
        const { commentId } = req.params;
        const { professorId } = req.query;

        if (!professorId) {
            return res.status(400).json({ error: 'Professor ID is required' });
        }

        // Verify professor owns the comment
        const { data: comment, error: checkError } = await supabase
            .from('student_comments')
            .select('professor_id')
            .eq('id', commentId)
            .single();

        if (checkError) throw checkError;

        if (comment.professor_id !== professorId) {
            return res.status(403).json({ error: 'Unauthorized to delete this comment' });
        }

        const { error } = await supabase
            .from('student_comments')
            .delete()
            .eq('id', commentId);

        if (error) throw error;

        res.json({ message: 'Comment deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get professor's courses
app.get('/api/professors/:professorId/courses', async (req, res) => {
    try {
        const { professorId } = req.params;

        const { data: courses, error } = await supabase
            .from('courses')
            .select('id, name, description, color, total_steps, created_at')
            .eq('professor_id', professorId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(courses || []);
    } catch (error: any) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ADMIN ENDPOINTS - HIERARCHICAL STRUCTURE
// ============================================

// ========== EDUCATIONAL CENTERS ==========

// Get all educational centers
app.get('/api/admin/centers', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('educational_centers')
            .select('*')
            .order('name');

        if (error) throw error;
        res.json(data || []);
    } catch (error: any) {
        console.error('Error fetching centers:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get specific educational center
app.get('/api/admin/centers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('educational_centers')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Center not found' });

        res.json(data);
    } catch (error: any) {
        console.error('Error fetching center:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create educational center
app.post('/api/admin/centers', async (req, res) => {
    try {
        const { name, address, phone, email } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const { data, error } = await supabase
            .from('educational_centers')
            .insert({ name, address, phone, email })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error: any) {
        console.error('Error creating center:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update educational center
app.put('/api/admin/centers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, address, phone, email, is_active } = req.body;

        const { data, error } = await supabase
            .from('educational_centers')
            .update({ name, address, phone, email, is_active })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        console.error('Error updating center:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete educational center
app.delete('/api/admin/centers/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('educational_centers')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Center deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting center:', error);
        res.status(500).json({ error: error.message });
    }
});

// ========== GRADES ==========

// Get grades by center
app.get('/api/admin/centers/:centerId/grades', async (req, res) => {
    try {
        const { centerId } = req.params;

        const { data, error } = await supabase
            .from('grades_levels')
            .select('*')
            .eq('center_id', centerId)
            .order('level');

        if (error) throw error;
        res.json(data || []);
    } catch (error: any) {
        console.error('Error fetching grades:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create grade
app.post('/api/admin/grades', async (req, res) => {
    try {
        const { center_id, name, level } = req.body;

        if (!center_id || !name) {
            return res.status(400).json({ error: 'Center ID and name are required' });
        }

        const { data, error } = await supabase
            .from('grades_levels')
            .insert({ center_id, name, level })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error: any) {
        console.error('Error creating grade:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update grade
app.put('/api/admin/grades/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, level, is_active } = req.body;

        const { data, error } = await supabase
            .from('grades_levels')
            .update({ name, level, is_active })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        console.error('Error updating grade:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete grade
app.delete('/api/admin/grades/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('grades_levels')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Grade deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting grade:', error);
        res.status(500).json({ error: error.message });
    }
});

// ========== SECTIONS ==========

// Get sections by grade
app.get('/api/admin/grades/:gradeId/sections', async (req, res) => {
    try {
        const { gradeId } = req.params;

        const { data, error } = await supabase
            .from('sections')
            .select('*')
            .eq('grade_id', gradeId)
            .order('name');

        if (error) throw error;
        res.json(data || []);
    } catch (error: any) {
        console.error('Error fetching sections:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create section
app.post('/api/admin/sections', async (req, res) => {
    try {
        const { grade_id, name, max_students } = req.body;

        if (!grade_id || !name) {
            return res.status(400).json({ error: 'Grade ID and name are required' });
        }

        const { data, error } = await supabase
            .from('sections')
            .insert({ grade_id, name, max_students })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error: any) {
        console.error('Error creating section:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update section
app.put('/api/admin/sections/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, max_students, is_active } = req.body;

        const { data, error } = await supabase
            .from('sections')
            .update({ name, max_students, is_active })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        console.error('Error updating section:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete section
app.delete('/api/admin/sections/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('sections')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Section deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting section:', error);
        res.status(500).json({ error: error.message });
    }
});

// ========== SUBJECTS ==========

// Get subjects by section
app.get('/api/admin/sections/:sectionId/subjects', async (req, res) => {
    try {
        const { sectionId } = req.params;

        const { data, error } = await supabase
            .from('subjects')
            .select('*')
            .eq('section_id', sectionId)
            .order('name');

        if (error) throw error;
        res.json(data || []);
    } catch (error: any) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create subject
app.post('/api/admin/subjects', async (req, res) => {
    try {
        const { section_id, name, description, hours_per_week } = req.body;

        if (!section_id || !name) {
            return res.status(400).json({ error: 'Section ID and name are required' });
        }

        const { data, error } = await supabase
            .from('subjects')
            .insert({ section_id, name, description, hours_per_week })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error: any) {
        console.error('Error creating subject:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update subject
app.put('/api/admin/subjects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, hours_per_week, is_active } = req.body;

        const { data, error } = await supabase
            .from('subjects')
            .update({ name, description, hours_per_week, is_active })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        console.error('Error updating subject:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete subject
app.delete('/api/admin/subjects/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('subjects')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Subject deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting subject:', error);
        res.status(500).json({ error: error.message });
    }
});

// ========== HIERARCHY VIEW ==========

// Get complete hierarchy for a center
app.get('/api/admin/centers/:centerId/hierarchy', async (req, res) => {
    try {
        const { centerId } = req.params;

        // Get center info
        const { data: center, error: centerError } = await supabase
            .from('educational_centers')
            .select('*')
            .eq('id', centerId)
            .single();

        if (centerError) throw centerError;

        // Get grades with sections and subjects
        const { data: grades, error: gradesError } = await supabase
            .from('grades_levels')
            .select(`
                *,
                sections (
                    *,
                    subjects (*)
                )
            `)
            .eq('center_id', centerId)
            .order('level');

        if (gradesError) throw gradesError;

        res.json({
            center,
            grades: grades || []
        });
    } catch (error: any) {
        console.error('Error fetching hierarchy:', error);
        res.status(500).json({ error: error.message });
    }
});

// Basic Route
app.get('/', (req, res) => {
    res.send('Backend API Running 🚀');
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
