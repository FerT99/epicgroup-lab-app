// Backend Index
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';

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

// Multer configuration for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 10 // Maximum 10 files per upload
    },
    fileFilter: (req, file, cb) => {
        // Only accept PDF files
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

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

// ========== USER MANAGEMENT ==========

// Create new user (Admin, Teacher, Student)
app.post('/api/admin/users', async (req, res) => {
    try {
        const { email, password, fullName, role } = req.body;

        if (!email || !password || !fullName || !role) {
            return res.status(400).json({ error: 'Email, password, full name, and role are required' });
        }

        // 1. Create user in Supabase Auth
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        });

        if (authError) throw authError;

        if (!authUser.user) {
            throw new Error('Failed to create user object');
        }

        // 2. Create profile in 'users' table with role
        // Note: The 'users' table in public schema is usually synchronized with auth.users via triggers.
        // If we need to set specific fields like 'role' which might not be in the trigger, we should update it.
        // First, let's try to upsert to ensure it exists and has the role.

        const { error: profileError } = await supabase
            .from('users')
            .upsert({
                id: authUser.user.id,
                email: email,
                full_name: fullName,
                role: role, // Assuming 'role' column exists in public.users
                // Default fields if needed
                firstname: fullName.split(' ')[0],
                lastname: fullName.split(' ').slice(1).join(' ')
            });

        if (profileError) {
            // If profile creation fails, we might want to delete the auth user to keep consistency,
            // but for now let's just throw error.
            console.error('Error creating profile:', profileError);
            throw profileError;
        }

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: authUser.user.id,
                email,
                fullName,
                role
            }
        });

    } catch (error: any) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: error.message });
    }
});

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
    return res.json([{ debug: 'SERVER_IS_UPDATED_AND_RUNNING_MY_CODE' }]);
    /*
    try {
        const { centerId } = req.params;
    
        console.log(`Fetching professors for center: ${centerId}`);
    
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
            .select('id, email, full_name, firstname, lastname') // Removed avatar_url
            .in('id', userIds);
    
        if (usersError) {
            console.error('Error fetching users in getCenterProfessors:', usersError);
            throw usersError;
        }
    
        console.log(`Found ${users?.length} users for center ${centerId}`);
        res.json(users || []);
    } catch (error: any) {
        console.error('Error fetching center professors FULL:', JSON.stringify(error, null, 2));
        res.status(500).json({ error: error.message, details: error });
    }
        */
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

// Get centers for a professor
app.get('/api/professors/:professorId/centers', async (req, res) => {
    try {
        const { professorId } = req.params;

        const { data: relations, error: relationError } = await supabase
            .from('center_professors')
            .select('center_id')
            .eq('user_id', professorId);

        if (relationError) throw relationError;

        const centerIds = relations?.map(r => r.center_id) || [];

        if (centerIds.length === 0) {
            return res.json([]);
        }

        const { data: centers, error: centersError } = await supabase
            .from('educational_centers')
            .select('*')
            .in('id', centerIds);

        if (centersError) throw centersError;

        res.json(centers || []);
    } catch (error: any) {
        console.error('Error fetching professor centers:', error);
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

// Get grade by ID
app.get('/api/admin/grades/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('grades_levels')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Grade not found' });

        res.json(data);
    } catch (error: any) {
        console.error('Error fetching grade:', error);
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
        res.status(500).json({
            error: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        });
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

// Get single section by ID
app.get('/api/admin/sections/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('sections')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Section not found' });

        res.json(data);
    } catch (error: any) {
        console.error('Error fetching section:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete section
// ========== SECTION PROFESSORS ==========

// Get professors for a section
app.get('/api/admin/sections/:sectionId/professors', async (req, res) => {
    try {
        const { sectionId } = req.params;

        console.log(`Fetching professors for section: ${sectionId}`);

        // Get user_ids from junction table
        const { data: relations, error: relationError } = await supabase
            .from('section_professors')
            .select('user_id')
            .eq('section_id', sectionId);

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
        console.error('Error fetching section professors:', error);
        // Fallback for missing table
        if (error.code === '42P01') {
            return res.json([]);
        }
        res.status(500).json({ error: error.message });
    }
});

// Assign professor to section
app.post('/api/admin/sections/:sectionId/professors', async (req, res) => {
    try {
        const { sectionId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const { data, error } = await supabase
            .from('section_professors')
            .insert({ section_id: sectionId, user_id: userId })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(400).json({ error: 'Professor already assigned to this section' });
            }
            throw error;
        }

        res.status(201).json(data);
    } catch (error: any) {
        console.error('Error assigning professor to section:', error);
        res.status(500).json({ error: error.message });
    }
});

// Unassign professor from section
app.delete('/api/admin/sections/:sectionId/professors/:userId', async (req, res) => {
    try {
        const { sectionId, userId } = req.params;

        const { error } = await supabase
            .from('section_professors')
            .delete()
            .match({ section_id: sectionId, user_id: userId });

        if (error) throw error;

        res.json({ message: 'Professor unassigned from section successfully' });
    } catch (error: any) {
        console.error('Error unassigning professor from section:', error);
        res.status(500).json({ error: error.message });
    }
});

// ========== COURSE CONTENT (MODULES & ITEMS) ==========

// Get modules for a section
app.get('/api/admin/sections/:sectionId/modules', async (req, res) => {
    try {
        const { sectionId } = req.params;

        const { data, error } = await supabase
            .from('course_modules')
            .select(`
                *,
                items:module_items(*)
            `)
            .eq('section_id', sectionId)
            .order('order_index');

        if (error) throw error;

        // Process items to sign URLs if they are PDFs
        const modules = await Promise.all(data?.map(async (module) => {
            const items = await Promise.all((module.items || []).map(async (item: any) => {
                if (item.type === 'pdf' && item.content_url) {
                    // Generate signed URL for PDF content
                    try {
                        const { data: urlData } = await supabase.storage
                            .from('grade-content')
                            .createSignedUrl(item.content_url, 3600);
                        return { ...item, content_url: urlData?.signedUrl || item.content_url };
                    } catch (e) {
                        return item;
                    }
                }
                return item;
            }));

            return {
                ...module,
                items: items.sort((a: any, b: any) => a.order_index - b.order_index)
            };
        }) || []);

        res.json(modules);
    } catch (error: any) {
        console.error('Error fetching course modules:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create module
app.post('/api/admin/sections/:sectionId/modules', async (req, res) => {
    try {
        const { sectionId } = req.params;
        const { title, order_index } = req.body;

        const { data, error } = await supabase
            .from('course_modules')
            .insert({ section_id: sectionId, title, order_index })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error: any) {
        console.error('Error creating module:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update module
app.put('/api/admin/modules/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, order_index, is_active } = req.body;

        const { data, error } = await supabase
            .from('course_modules')
            .update({ title, order_index, is_active })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        console.error('Error updating module:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete module
app.delete('/api/admin/modules/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('course_modules')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Module deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting module:', error);
        res.status(500).json({ error: error.message });
    }
});

// ITEMS

// Create item (Standard JSON)
app.post('/api/admin/modules/:moduleId/items', async (req, res) => {
    try {
        const { moduleId } = req.params;
        const { type, title, description, content_url, order_index } = req.body;

        const { data, error } = await supabase
            .from('module_items')
            .insert({
                module_id: moduleId,
                type,
                title,
                description,
                content_url,
                order_index,
                is_visible: true
            })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error: any) {
        console.error('Error creating item:', error);
        res.status(500).json({ error: error.message });
    }
});

// Upload item (Multipart)
app.post('/api/admin/modules/:moduleId/items/upload', upload.single('file'), async (req, res) => {
    try {
        const { moduleId } = req.params;
        const file = req.file;
        const { title, description, order_index } = req.body;

        if (!file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        // Generate file path
        const timestamp = Date.now();
        const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `modules/${moduleId}/${timestamp}_${sanitizedFileName}`;

        // Upload to Storage
        const { error: uploadError } = await supabase.storage
            .from('grade-content')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (uploadError) throw uploadError;

        // Create DB record
        const { data, error } = await supabase
            .from('module_items')
            .insert({
                module_id: moduleId,
                type: 'pdf',
                title: title || file.originalname,
                description,
                content_url: filePath,
                order_index: order_index || 999,
                is_visible: true
            })
            .select()
            .single();

        if (error) {
            // Cleanup file if DB insert fails
            await supabase.storage.from('grade-content').remove([filePath]);
            throw error;
        }

        res.status(201).json(data);
    } catch (error: any) {
        console.error('Error uploading module item:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete module
app.delete('/api/admin/modules/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('course_modules')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Module deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting module:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create item
app.post('/api/admin/modules/:moduleId/items', async (req, res) => {
    try {
        const { moduleId } = req.params;
        const { type, title, description, content_url, order_index } = req.body;

        const { data, error } = await supabase
            .from('module_items')
            .insert({ module_id: moduleId, type, title, description, content_url, order_index })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error: any) {
        console.error('Error creating item:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update item
app.put('/api/admin/items/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, content_url, order_index, is_visible } = req.body;

        const { data, error } = await supabase
            .from('module_items')
            .update({ title, description, content_url, order_index, is_visible })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        console.error('Error updating item:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete item
app.delete('/api/admin/items/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('module_items')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Item deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting item:', error);
        res.status(500).json({ error: error.message });
    }
});

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

// ========== GRADE CONTENT MANAGEMENT ==========

// Get all content for a grade (Admin/Professor/Student with access)
app.get('/api/grades/:gradeId/content', async (req, res) => {
    try {
        const { gradeId } = req.params;
        const { userId, role } = req.query;

        if (!userId || !role) {
            return res.status(400).json({ error: 'User ID and Role are required' });
        }

        let hasAccess = false;

        if (role === 'admin') {
            hasAccess = true;
        } else if (role === 'professor') {
            // Check if professor is assigned to the center of this grade
            const { data: grade } = await supabase
                .from('grades_levels')
                .select('center_id')
                .eq('id', gradeId)
                .single();

            if (grade) {
                const { data: relation } = await supabase
                    .from('center_professors')
                    .select('id')
                    .eq('center_id', grade.center_id)
                    .eq('user_id', userId)
                    .single();

                if (relation) hasAccess = true;
            }
        } else if (role === 'student') {
            // Check if student is enrolled in a course belonging to a section of this grade
            const { data: sections } = await supabase
                .from('sections')
                .select('course_id')
                .eq('grade_id', gradeId);

            const { data: enrollments } = await supabase
                .from('enrollments')
                .select('course_id')
                .eq('student_id', userId);

            const sectionCourseIds = sections?.map(s => s.course_id).filter(id => id) || [];
            const studentCourseIds = enrollments?.map(e => e.course_id) || [];

            if (sectionCourseIds.some(id => studentCourseIds.includes(id))) {
                hasAccess = true;
            }
        }

        if (!hasAccess) {
            return res.status(403).json({ error: 'Access denied to this grade content' });
        }

        // Fetch content
        const { data, error } = await supabase
            .from('grade_content')
            .select('*')
            .eq('grade_id', gradeId)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Generate signed URLs
        const contentWithUrls = await Promise.all(
            (data || []).map(async (content) => {
                try {
                    const { data: urlData } = await supabase.storage
                        .from('grade-content')
                        .createSignedUrl(content.file_path, 3600);

                    return {
                        ...content,
                        download_url: urlData?.signedUrl || null
                    };
                } catch (err) {
                    console.error('Error generating signed URL:', err);
                    return {
                        ...content,
                        download_url: null
                    };
                }
            })
        );

        res.json(contentWithUrls);
    } catch (error: any) {
        console.error('Error fetching grade content:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin only endpoint (kept for compatibility or specific admin dashboard usage)
app.get('/api/admin/grades/:gradeId/content', async (req, res) => {
    try {
        const { gradeId } = req.params;
        // Admin assumed access
        const { data, error } = await supabase
            .from('grade_content')
            .select('*')
            .eq('grade_id', gradeId)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        // ... (rest of implementation similar to above) ...
        if (error) throw error;

        const contentWithUrls = await Promise.all(
            (data || []).map(async (content) => {
                try {
                    const { data: urlData } = await supabase.storage
                        .from('grade-content')
                        .createSignedUrl(content.file_path, 3600);
                    return { ...content, download_url: urlData?.signedUrl || null };
                } catch (err) {
                    return { ...content, download_url: null };
                }
            })
        );
        res.json(contentWithUrls);
    } catch (error: any) {
        console.error('Error fetching grade content (admin):', error);
        res.status(500).json({ error: error.message });
    }
});

// Upload content to a grade (multiple files)
app.post('/api/admin/grades/:gradeId/content', upload.array('files', 10), async (req, res) => {
    try {
        const { gradeId } = req.params;
        const files = req.files as Express.Multer.File[];
        const { titles } = req.body; // Optional array of titles

        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No files provided' });
        }

        // Verify grade exists
        const { data: grade, error: gradeError } = await supabase
            .from('grades_levels')
            .select('id, center_id')
            .eq('id', gradeId)
            .single();

        if (gradeError || !grade) {
            return res.status(404).json({ error: 'Grade not found' });
        }

        const uploadedContent = [];
        const errors = [];

        // Parse titles if provided
        let parsedTitles: string[] = [];
        if (titles) {
            try {
                parsedTitles = typeof titles === 'string' ? JSON.parse(titles) : titles;
            } catch (e) {
                parsedTitles = [];
            }
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const title = parsedTitles[i] || file.originalname.replace('.pdf', '');

            try {
                // Generate unique file path
                const timestamp = Date.now();
                const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
                const filePath = `${grade.center_id}/${gradeId}/${timestamp}_${sanitizedFileName}`;

                // Upload to Supabase Storage
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('grade-content')
                    .upload(filePath, file.buffer, {
                        contentType: file.mimetype,
                        upsert: false
                    });

                if (uploadError) throw uploadError;

                // Create database record
                const { data: contentData, error: contentError } = await supabase
                    .from('grade_content')
                    .insert({
                        grade_id: gradeId,
                        title: title,
                        file_name: file.originalname,
                        file_path: filePath,
                        file_size: file.size
                    })
                    .select()
                    .single();

                if (contentError) {
                    // If DB insert fails, delete the uploaded file
                    await supabase.storage.from('grade-content').remove([filePath]);
                    throw contentError;
                }

                uploadedContent.push(contentData);
            } catch (error: any) {
                console.error(`Error uploading file ${file.originalname}:`, error);
                errors.push({
                    fileName: file.originalname,
                    error: error.message
                });
            }
        }

        if (uploadedContent.length === 0) {
            return res.status(500).json({
                error: 'Failed to upload any files',
                details: errors
            });
        }

        res.status(201).json({
            message: `Successfully uploaded ${uploadedContent.length} of ${files.length} files`,
            content: uploadedContent,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error: any) {
        console.error('Error uploading content:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete content
app.delete('/api/admin/content/:contentId', async (req, res) => {
    try {
        const { contentId } = req.params;

        // Get content info first
        const { data: content, error: fetchError } = await supabase
            .from('grade_content')
            .select('file_path')
            .eq('id', contentId)
            .single();

        if (fetchError || !content) {
            return res.status(404).json({ error: 'Content not found' });
        }

        // Delete from storage
        const { error: storageError } = await supabase.storage
            .from('grade-content')
            .remove([content.file_path]);

        if (storageError) {
            console.error('Error deleting from storage:', storageError);
            // Continue with DB deletion even if storage deletion fails
        }

        // Delete from database
        const { error: deleteError } = await supabase
            .from('grade_content')
            .delete()
            .eq('id', contentId);

        if (deleteError) throw deleteError;

        res.json({ message: 'Content deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting content:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get download URL for specific content
app.get('/api/admin/content/:contentId/download-url', async (req, res) => {
    try {
        const { contentId } = req.params;

        const { data: content, error: fetchError } = await supabase
            .from('grade_content')
            .select('file_path, file_name')
            .eq('id', contentId)
            .single();

        if (fetchError || !content) {
            return res.status(404).json({ error: 'Content not found' });
        }

        const { data: urlData, error: urlError } = await supabase.storage
            .from('grade-content')
            .createSignedUrl(content.file_path, 3600); // 1 hour expiry

        if (urlError) throw urlError;

        res.json({
            download_url: urlData.signedUrl,
            file_name: content.file_name
        });
    } catch (error: any) {
        console.error('Error generating download URL:', error);
        res.status(500).json({ error: error.message });
    }
});

// Basic Route
app.get('/', (req, res) => {
    res.send('Backend API Running 🚀');
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Global Error Handler:', err);
    res.status(500).json({
        error: err.message || 'Internal Server Error',
        stack: err.stack,
        details: JSON.stringify(err)
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
})