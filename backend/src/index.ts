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
                id: g.id,
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

// Get grade summary for all students of a professor
app.get('/api/professors/:professorId/grades-summary', async (req, res) => {
    try {
        const { professorId } = req.params;

        // 1. Get students enrolled in professor's courses
        const { data: enrollments, error: enrollmentsError } = await supabase
            .from('enrollments')
            .select(`
                student_id,
                courses!inner (
                    id,
                    professor_id
                )
            `)
            .eq('courses.professor_id', professorId);

        if (enrollmentsError) throw enrollmentsError;

        const studentIds = [...new Set(enrollments?.map(e => e.student_id))];

        if (studentIds.length === 0) {
            return res.json([]);
        }

        // 2. Get Student Info
        const { data: students, error: studentsError } = await supabase
            .from('users')
            .select('id, full_name, email, firstname, lastname, avatar_url')
            .in('id', studentIds);

        if (studentsError) throw studentsError;

        // 3. Get Grades for these students
        // Note: Ideally we should filter grades by the professor's courses too, 
        // to avoid averaging grades from other professors.
        // First get course IDs belonging to professor
        const courseIds = enrollments!.map(e => (e.courses as any).id);

        const { data: grades, error: gradesError } = await supabase
            .from('grades')
            .select('student_id, grade, max_grade')
            .in('student_id', studentIds);
        // .in('course_id', courseIds); // Assuming grades table has course_id, let's verify or assume safe logic. 
        // Previous GET /progress used course_name but presumably there is a link.
        // If grades table doesn't have course_id directly queryable or if we want to be simple:
        // Let's assume for now we take all grades for the student. 
        // Refinement: The previous endpoint used `grades` table. 
        // Let's optimize: fetch grades where student_id IN (...) AND course table has professor_id...
        // Complex query. For MVP, fetching all grades for these students is acceptable 
        // OR client side filtering if we had course link.
        // Let's stick to "All grades for the student" for the summary for now.

        if (gradesError) throw gradesError;

        // 4. Calculate Averages
        const summary = students!.map((student, index) => {
            const studentGrades = grades?.filter(g => g.student_id === student.id) || [];

            let average = 0;
            if (studentGrades.length > 0) {
                const sum = studentGrades.reduce((acc, g) => acc + (g.grade / g.max_grade) * 100, 0);
                average = sum / studentGrades.length;
            }

            return {
                id: index + 1, // Frontend expects a number ID for display? Or UUID?
                userId: student.id,
                name: student.full_name || `${student.firstname || ''} ${student.lastname || ''}`.trim() || 'Alumno',
                email: student.email,
                avatar: student.avatar_url,
                average: Math.round(average),
                color: ['purple', 'orange', 'salmon', 'blue'][index % 4]
            };
        });

        res.json(summary);

    } catch (error: any) {
        console.error('Error fetching grades summary:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update grade
app.put('/api/grades/:gradeId', async (req, res) => {
    try {
        const { gradeId } = req.params;
        const { grade } = req.body;

        if (grade === undefined) {
            return res.status(400).json({ error: 'Grade is required' });
        }

        const { data, error } = await supabase
            .from('grades')
            .update({ grade, graded_at: new Date().toISOString() })
            .eq('id', gradeId)
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error: any) {
        console.error('Error updating grade:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get unique assignments (derived from grades)
app.get('/api/professors/:professorId/assignments', async (req, res) => {
    try {
        const { professorId } = req.params;

        // Get enrollments to link professor to courses
        // Actually, we can just get courses for professor, then get grades for those courses
        const { data: courses, error: coursesError } = await supabase
            .from('courses')
            .select('id, name')
            .eq('professor_id', professorId);

        if (coursesError) throw coursesError;

        if (!courses || courses.length === 0) return res.json([]);

        const courseNames = courses.map(c => c.name);

        // Get unique assignment names from grades for these courses
        // Note: supabase doesn't support 'distinct' easily on select with other columns for counting
        // We will fetch all grades and aggregate in JS for MVP (assuming not millions of rows yet)
        const { data: grades, error: gradesError } = await supabase
            .from('grades')
            .select('id, assignment_name, course_name, grade')
            .in('course_name', courseNames); // Assuming course_name matches

        if (gradesError) throw gradesError;

        // Aggregate
        const assignmentsMap = new Map();

        grades?.forEach(g => {
            const key = `${g.course_name}-${g.assignment_name}`;
            if (!assignmentsMap.has(key)) {
                assignmentsMap.set(key, {
                    id: key, // Virtual ID
                    title: g.assignment_name,
                    courseName: g.course_name,
                    total: 0,
                    graded: 0
                });
            }
            const assignment = assignmentsMap.get(key);
            assignment.total++;
            if (g.grade !== null && g.grade > 0) { // Assuming 0 or null is pending
                assignment.graded++;
            }
        });

        res.json(Array.from(assignmentsMap.values()));

    } catch (error: any) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get submissions for an assignment
app.get('/api/assignments/submissions', async (req, res) => {
    try {
        const { assignment, course } = req.query;

        if (!assignment || !course) {
            return res.status(400).json({ error: 'Assignment and Course are required' });
        }

        const { data: grades, error } = await supabase
            .from('grades')
            .select(`
                id,
                grade,
                max_grade,
                graded_at,
                student_id
             `)
            .eq('assignment_name', assignment)
            .eq('course_name', course);

        if (error) throw error;

        // We also need student names. 
        const studentIds = grades?.map(g => g.student_id);
        const { data: students } = await supabase
            .from('users')
            .select('id, full_name, email')
            .in('id', studentIds || []);

        const result = grades?.map(g => {
            const student = students?.find(s => s.id === g.student_id);
            return {
                gradeId: g.id,
                studentId: g.student_id,
                studentName: student?.full_name || 'Estudiante',
                grade: g.grade,
                maxGrade: g.max_grade,
                status: (g.grade !== null && g.grade > 0) ? 'Calificado' : 'Pendiente'
            };
        });

        res.json(result || []);

    } catch (error: any) {
        console.error('Error fetching submissions:', error);
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

// ========== CENTER PROFESSORS ==========

// Get professors for a center
app.get('/api/admin/centers/:centerId/professors', async (req, res) => {
    try {
        const { centerId } = req.params;

        // Get user_ids from junction table
        const { data: relations, error: relationError } = await supabase
            .from('center_professors')
            .select('user_id')
            .eq('center_id', centerId);

        if (relationError) throw relationError;

        const userIds = relations?.map(r => r.user_id) || [];

        if (userIds.length === 0) {
            return res.json([]);
        }

        // Get user details
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, email, full_name, firstname, lastname, avatar_url')
            .in('id', userIds);

        if (usersError) throw usersError;

        res.json(users || []);
    } catch (error: any) {
        console.error('Error fetching center professors:', error);
        res.status(500).json({ error: error.message });
    }
});

// Assign professor to center
app.post('/api/admin/centers/:centerId/professors', async (req, res) => {
    try {
        const { centerId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const { data, error } = await supabase
            .from('center_professors')
            .insert({ center_id: centerId, user_id: userId })
            .select()
            .single();

        if (error) {
            // Check for duplicate key error (already assigned)
            if (error.code === '23505') {
                return res.status(400).json({ error: 'Professor already assigned to this center' });
            }
            throw error;
        }

        res.status(201).json(data);
    } catch (error: any) {
        console.error('Error assigning professor:', error);
        res.status(500).json({ error: error.message });
    }
});

// Unassign professor from center
app.delete('/api/admin/centers/:centerId/professors/:userId', async (req, res) => {
    try {
        const { centerId, userId } = req.params;

        const { error } = await supabase
            .from('center_professors')
            .delete()
            .match({ center_id: centerId, user_id: userId });

        if (error) throw error;

        res.json({ message: 'Professor unassigned successfully' });
    } catch (error: any) {
        console.error('Error unassigning professor:', error);
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
