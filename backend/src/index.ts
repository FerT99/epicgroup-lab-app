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

// ===========================================
// STUDENT TUTORS
// ===========================================

// Get tutors linked to a student
app.get('/api/admin/students/:studentId/tutors', async (req, res) => {
    try {
        const { studentId } = req.params;

        const { data: relations, error: relationError } = await supabase
            .from('student_tutors')
            .select('tutor_id')
            .eq('student_id', studentId);

        if (relationError) throw relationError;

        const tutorIds = relations?.map(r => r.tutor_id) || [];

        if (tutorIds.length === 0) {
            return res.json([]);
        }

        const { data: tutors, error: tutorsError } = await supabase
            .from('users')
            .select('id, full_name, email, firstname, lastname')
            .in('id', tutorIds);

        if (tutorsError) throw tutorsError;

        res.json(tutors || []);
    } catch (error: any) {
        console.error('Error fetching student tutors:', error);
        // Fallback for missing table
        if (error.code === '42P01') {
            return res.json([]);
        }
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// STUDENT PROGRESS ENDPOINTS
// ============================================

// Get student courses (subjects enrolled)

// Get tutor's students' courses
app.get('/api/tutors/:tutorId/courses', async (req, res) => {
    try {
        const { tutorId } = req.params;

        // 1. Get students for this tutor
        const { data: studentTutors, error: tutorError } = await supabase
            .from('student_tutors')
            .select('student_id')
            .eq('tutor_id', tutorId);
            
        if (tutorError) throw tutorError;
        if (!studentTutors || studentTutors.length === 0) return res.json([]);

        const studentIds = studentTutors.map(st => st.student_id);

        // 2. Get enrollments for these students
        const { data: enrollments, error: enrollmentsError } = await supabase
            .from('enrollments')
            .select('subject_id, grade_id, center_id')
            .in('student_id', studentIds);

        if (enrollmentsError) throw enrollmentsError;
        if (!enrollments || enrollments.length === 0) return res.json([]);

        const subjectIds = [...new Set(enrollments.map(e => e.subject_id))];

        // 3. Get subjects details
        const { data: subjects, error: subjectsError } = await supabase
            .from('subjects')
            .select('id, name, grade_id')
            .in('id', subjectIds);

        if (subjectsError) throw subjectsError;

        // 4. Get grades and centers
        const { data: grades, error: gradesError } = await supabase
            .from('grades_levels')
            .select('id, name, center_id')
            .in('id', enrollments.map(e => e.grade_id));
            
        if (gradesError) throw gradesError;

        const { data: centers, error: centersError } = await supabase
            .from('educational_centers')
            .select('id, name')
            .in('id', grades?.map(g => g.center_id) || []);

        if (centersError) throw centersError;

        // 5. Format response
        const formattedCourses = subjects?.map(subject => {
            const grade = grades?.find(g => g.id === subject.grade_id);
            const center = centers?.find(c => c.id === grade?.center_id);
            
            return {
                id: subject.id,
                name: subject.name,
                grade_name: grade?.name || 'Sin grado',
                grade_id: subject.grade_id,
                center_id: grade?.center_id,
                center_name: center?.name || 'Sin centro'
            };
        });

        res.json(formattedCourses || []);
    } catch (error: any) {
        console.error('Error fetching tutor courses:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/students/:studentId/courses', async (req, res) => {
    try {
        const { studentId } = req.params;

        // 1. Get enrollments for the student
        const { data: enrollments, error: enrollmentsError } = await supabase
            .from('enrollments')
            .select(`
                subject_id,
                grade_id,
                center_id
            `)
            .eq('student_id', studentId);

        console.log('Enrollments:', enrollments);
        if (enrollmentsError) throw enrollmentsError;
        if (!enrollments || enrollments.length === 0) {
            return res.json([]);
        }

        const subjectIds = enrollments.map(e => e.subject_id);

        // 2. Get subjects details
        const { data: subjects, error: subjectsError } = await supabase
            .from('subjects')
            .select(`
                id,
                name,
                grade_id
            `)
            .in('id', subjectIds);

        if (subjectsError) throw subjectsError;

        // 3. Get grades and centers details to format exactly like ProfessorDashboard expects
        const { data: grades, error: gradesError } = await supabase
            .from('grades_levels')
            .select('id, name, center_id')
            .in('id', enrollments.map(e => e.grade_id));
            
        if (gradesError) throw gradesError;

        const { data: centers, error: centersError } = await supabase
            .from('educational_centers')
            .select('id, name')
            .in('id', grades?.map(g => g.center_id) || []);

        if (centersError) throw centersError;

        // Format the response
        const formattedCourses = subjects?.map(subject => {
            const grade = grades?.find(g => g.id === subject.grade_id);
            const center = centers?.find(c => c.id === grade?.center_id);
            
            return {
                id: subject.id,
                name: subject.name,
                grade_id: grade?.id,
                grade_name: grade?.name,
                center_id: center?.id,
                center_name: center?.name
            };
        });

        res.json(formattedCourses || []);
    } catch (error: any) {
        console.error('Error fetching student courses:', error);
        res.status(500).json({ error: error.message });
    }
});

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

        // Get enrollments to find subjects
        const { data: enrollments, error: enrollmentsError } = await supabase
            .from('enrollments')
            .select('subject_id')
            .eq('student_id', studentId);

        if (enrollmentsError) throw enrollmentsError;
        
        const subjectIds = enrollments?.map(e => e.subject_id) || [];
        
        // Get subjects for those subjects
        const { data: subjects, error: subjectsError } = await supabase
            .from('subjects')
            .select('id, name')
            .in('id', subjectIds);

        // Get student progress for courses
        const { data: progressData } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', studentId);

        // Get completed tasks with grades
        const { data: completions, error: completionsError } = await supabase
            .from('user_task_completions')
            .select(`
                id,
                score,
                teacher_feedback,
                graded_at,
                course_tasks!inner(title, course_id)
            `)
            .eq('user_id', studentId)
            .order('graded_at', { ascending: false });

        if (completionsError) throw completionsError;

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
            courses: subjects?.map(sub => {
                const p = progressData?.find(p => p.course_id === sub.id);
                return {
                    id: sub.id,
                    name: sub.name,
                    progress: p?.progress_percentage || 0,
                    color: 'purple'
                };
            }) || [],
            grades: completions?.filter(c => c.score !== null).map((c: any) => ({
                id: c.id,
                courseName: subjects?.find(s => s.id === c.course_tasks.course_id)?.name || 'Materia',
                grade: c.score,
                maxGrade: 100,
                assignmentName: c.course_tasks.title,
                gradedAt: c.graded_at
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

// Get ALL registered users with role=student (for search-and-enroll)
app.get('/api/users/students', async (req, res) => {
    try {
        const { data: students, error } = await supabase
            .from('users')
            .select('id, full_name, email, firstname, lastname, avatar_url')
            .eq('role', 'student')
            .order('full_name', { ascending: true });

        if (error) throw error;

        const formatted = (students || []).map((s) => ({
            id: s.id,
            name: s.full_name || `${s.firstname || ''} ${s.lastname || ''}`.trim() || s.email,
            email: s.email,
        }));

        res.json(formatted);
    } catch (error: any) {
        console.error('Error fetching all students:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get students (optionally filtered by professor)

app.get('/api/students', async (req, res) => {
    try {
        const professorId = req.query.professorId as string;
        
        let studentIds: string[] = [];
        
        if (professorId) {
            // 1. Get subjects for professor
            const { data: profSubjects, error: profSubjError } = await supabase
                .from('professor_subjects')
                .select('subject_id')
                .eq('professor_id', professorId);

            if (profSubjError) throw profSubjError;

            const subjectIds = [...new Set(profSubjects?.map(ps => ps.subject_id))];

            if (subjectIds.length === 0) return res.json([]);

            // 2. Get enrollments for those subjects
            const { data: enrollments, error: enrollmentsError } = await supabase
                .from('enrollments')
                .select('student_id')
                .in('subject_id', subjectIds);

            if (enrollmentsError) throw enrollmentsError;

            studentIds = [...new Set(enrollments?.map(e => e.student_id))];

            if (studentIds.length === 0) return res.json([]);
        }

        // 3. Get Student Info
        let query = supabase
            .from('users')
            .select('id, full_name, email, firstname, lastname, avatar_url')
            .eq('role', 'student');
            
        if (studentIds.length > 0) {
            query = query.in('id', studentIds);
        } else if (professorId) {
            return res.json([]);
        }

        const { data: students, error: studentsError } = await query;

        if (studentsError) throw studentsError;

        // Map to format expected by frontend
        const formattedStudents = students?.map((student, index) => ({
            id: index + 1,
            userId: student.id,
            name: student.full_name || `${student.firstname || ''} ${student.lastname || ''}`.trim() || 'Alumno',
            email: student.email,
            description: 'Estudiante',
            color: ['purple', 'orange', 'salmon', 'blue'][index % 4]
        })) || [];

        res.json(formattedStudents);

    } catch (error: any) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get professor's courses
app.get('/api/professors/:professorId/courses', async (req, res) => {
    try {
        const { professorId } = req.params;

        const { data: profSubjects, error } = await supabase
            .from('professor_subjects')
            .select(`
                subjects (
                    id, 
                    name, 
                    description, 
                    created_at,
                    grades_levels (
                        id,
                        name,
                        educational_centers (
                            id,
                            name
                        )
                    )
                )
            `)
            .eq('professor_id', professorId);

        if (error) throw error;
        
        const courses = profSubjects?.map(ps => {
            const subject = ps.subjects as any;
            const grade = subject?.grades_levels || {};
            const center = grade?.educational_centers || {};
            
            return {
                id: subject.id,
                title: subject.name,
                description: `${grade.name || 'Sin grado'} • ${subject.name}`,
                completedSteps: Math.floor(Math.random() * 100), // Mock progress
                totalSteps: 100,
                gradeId: grade.id,
                centerId: center.id,
                centerName: center.name || 'Centro Educativo'
            };
        }) || [];

        res.json(courses);
    } catch (error: any) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get grade summary for all students of a professor
app.get('/api/professors/:professorId/grades-summary', async (req, res) => {
    try {
        const { professorId } = req.params;

        // 1. Get subjects taught by professor to find their subj
        const { data: profSubjects, error: profSubjError } = await supabase
            .from('professor_subjects')
            .select('subjects!inner(subject_id)')
            .eq('professor_id', professorId);

        if (profSubjError) throw profSubjError;

        const subjectIds = [...new Set(profSubjects?.map(ps => (ps.subjects as any).subject_id))];

        if (subjectIds.length === 0) return res.json([]);

        // 2. Get enrollments for those subjects
        const { data: enrollments, error: enrollmentsError } = await supabase
            .from('enrollments')
            .select('student_id')
            .in('subject_id', subjectIds);

        if (enrollmentsError) throw enrollmentsError;

        const studentIds = [...new Set(enrollments?.map(e => e.student_id))];

        if (studentIds.length === 0) return res.json([]);

        // 3. Get Student Info
        const { data: students, error: studentsError } = await supabase
            .from('users')
            .select('id, full_name, email, firstname, lastname, avatar_url')
            .in('id', studentIds);

        if (studentsError) throw studentsError;

        // 4. Get Task Completions for these students
        const { data: completions, error: completionsError } = await supabase
            .from('user_task_completions')
            .select('user_id, score')
            .in('user_id', studentIds)
            .not('score', 'is', null);

        if (completionsError) throw completionsError;

        // 5. Calculate Averages
        const summary = students!.map((student, index) => {
            const studentCompletions = completions?.filter(c => c.user_id === student.id) || [];

            let average = 0;
            if (studentCompletions.length > 0) {
                const sum = studentCompletions.reduce((acc, c) => acc + (c.score || 0), 0);
                average = sum / studentCompletions.length;
            }

            return {
                id: index + 1,
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
            .from('user_task_completions')
            .update({ score: grade, graded_at: new Date().toISOString() })
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

// Get unique assignments (derived from course_tasks and completions)
app.get('/api/professors/:professorId/assignments', async (req, res) => {
    try {
        const { professorId } = req.params;

        // Get subjects for professor
        const { data: profSubjects, error: profSubjError } = await supabase
            .from('professor_subjects')
            .select('subject_id, subjects(name)')
            .eq('professor_id', professorId);

        if (profSubjError) throw profSubjError;

        if (!profSubjects || profSubjects.length === 0) return res.json([]);

        const subjectIds = profSubjects.map(ps => ps.subject_id);

        // Get tasks for those subjects
        const { data: tasks, error: tasksError } = await supabase
            .from('course_tasks')
            .select('id, course_id, title')
            .in('course_id', subjectIds);

        if (tasksError) throw tasksError;

        if (!tasks || tasks.length === 0) return res.json([]);

        const taskIds = tasks.map(t => t.id);

        // Get completions
        const { data: completions, error: completionsError } = await supabase
            .from('user_task_completions')
            .select('task_id, score')
            .in('task_id', taskIds);

        if (completionsError) throw completionsError;

        // Aggregate
        const assignmentsMap = new Map();

        tasks.forEach(task => {
            const subjectName = (profSubjects.find(ps => ps.subject_id === task.course_id)?.subjects as any)?.name || 'Materia';
            const key = `${task.course_id}-${task.id}`;
            
            assignmentsMap.set(key, {
                id: key,
                title: task.title,
                courseName: subjectName,
                total: 0,
                graded: 0
            });
        });
        
        completions?.forEach(c => {
            const task = tasks.find(t => t.id === c.task_id);
            if (!task) return;
            const key = `${task.course_id}-${task.id}`;
            const assignment = assignmentsMap.get(key);
            if (assignment) {
                assignment.total++;
                if (c.score !== null) {
                    assignment.graded++;
                }
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
        
        // Find subject by name
        const { data: subjects, error: subjError } = await supabase
            .from('subjects')
            .select('id')
            .eq('name', course)
            .limit(1);
            
        if (subjError || !subjects || subjects.length === 0) throw new Error('Subject not found');
        const subjectId = subjects[0].id;
        
        // Find task by title and subject
        const { data: tasks, error: taskError } = await supabase
            .from('course_tasks')
            .select('id')
            .eq('title', assignment)
            .eq('course_id', subjectId)
            .limit(1);
            
        if (taskError || !tasks || tasks.length === 0) throw new Error('Task not found');
        const taskId = tasks[0].id;

        const { data: completions, error } = await supabase
            .from('user_task_completions')
            .select(`
                id,
                score,
                graded_at,
                user_id,
                users!inner(full_name)
             `)
            .eq('task_id', taskId);

        if (error) throw error;

        const result = completions?.map(c => {
            return {
                gradeId: c.id,
                studentId: c.user_id,
                studentName: (c.users as any)?.full_name || 'Estudiante',
                grade: c.score,
                maxGrade: 100,
                status: (c.score !== null) ? 'Calificado' : 'Pendiente'
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

// Create a tutor account and link it to a student
app.post('/api/admin/students/:studentId/tutor', async (req, res) => {
    try {
        const { studentId } = req.params;
        const { email, password, fullName } = req.body;

        if (!email || !password || !fullName) {
            return res.status(400).json({ error: 'Email, password, and full name are required' });
        }

        // 1. Create the tutor user in Supabase Auth
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        });

        if (authError) throw authError;
        if (!authUser.user) throw new Error('Failed to create tutor user');

        const tutorId = authUser.user.id;

        // 2. Insert into public.users with role='tutor'
        const { error: profileError } = await supabase
            .from('users')
            .upsert({
                id: tutorId,
                email,
                full_name: fullName,
                role: 'tutor',
                firstname: fullName.split(' ')[0],
                lastname: fullName.split(' ').slice(1).join(' ')
            });

        if (profileError) throw profileError;

        // 3. Link tutor to student in student_tutors table
        const { error: linkError } = await supabase
            .from('student_tutors')
            .insert({ student_id: studentId, tutor_id: tutorId });

        if (linkError) {
            // If the table doesn't exist yet, still return success with a warning
            console.warn('Could not link tutor to student (student_tutors table may not exist):', linkError.message);
            return res.status(201).json({
                message: 'Tutor created but could not be linked (student_tutors table missing)',
                tutor: { id: tutorId, email, fullName, role: 'tutor' },
                warning: linkError.message
            });
        }

        res.status(201).json({
            message: 'Tutor created and linked to student successfully',
            tutor: { id: tutorId, email, fullName, role: 'tutor' }
        });

    } catch (error: any) {
        console.error('Error creating tutor:', error);
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

// ========== ENROLLMENTS ==========

// Enroll a new student in a grade (and all of its subjects)
app.post('/api/admin/enrollments', async (req, res) => {
    try {
        const { center_id, grade_id, student_id } = req.body;

        if (!center_id || !grade_id || !student_id) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // 1. Get all subjects belonging to this grade
        const { data: subjects, error: subjectsError } = await supabase
            .from('subjects')
            .select('id')
            .eq('grade_id', grade_id);

        if (subjectsError) throw subjectsError;

        if (!subjects || subjects.length === 0) {
            return res.status(400).json({ error: 'This grade has no subjects to enroll into' });
        }

        // 2. Build one enrollment row per subject
        const now = new Date().toISOString();
        const rows = subjects.map(subject => ({
            subject_id: subject.id,
            grade_id,
            center_id,
            student_id,
            created_at: now,
            status: 'active'
        }));

        // 3. Insert all enrollments at once
        const { data, error } = await supabase
            .from('enrollments')
            .insert(rows)
            .select();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error: any) {
        console.error('Error enrolling student:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get students enrolled in a specific grade
app.get('/api/admin/grades/:gradeId/students', async (req, res) => {
    try {
        const { gradeId } = req.params;

        // 1. Get distinct student_ids enrolled in this grade
        const { data: enrollments, error: enrollErr } = await supabase
            .from('enrollments')
            .select('student_id')
            .eq('grade_id', gradeId);

        if (enrollErr) throw enrollErr;

        if (!enrollments || enrollments.length === 0) {
            return res.json([]);
        }

        const studentIds = [...new Set(enrollments.map(e => e.student_id))];

        // 2. Fetch user details for those students
        const { data: students, error: studErr } = await supabase
            .from('users')
            .select('id, full_name, email, firstname, lastname, avatar_url')
            .in('id', studentIds)
            .order('full_name', { ascending: true });

        if (studErr) throw studErr;

        const formatted = (students || []).map(s => ({
            id: s.id,
            name: s.full_name || `${s.firstname || ''} ${s.lastname || ''}`.trim() || s.email,
            email: s.email,
            avatar_url: s.avatar_url,
        }));

        res.json(formatted);
    } catch (error: any) {
        console.error('Error fetching grade students:', error);
        res.status(500).json({ error: error.message });
    }
});


// Remove a student from a grade (delete their enrollments for that grade)
app.delete('/api/admin/grades/:gradeId/students/:studentId', async (req, res) => {
    try {
        const { gradeId, studentId } = req.params;

        const { error } = await supabase
            .from('enrollments')
            .delete()
            .eq('grade_id', gradeId)
            .eq('student_id', studentId);

        if (error) throw error;

        res.json({ message: 'Student removed from grade successfully' });
    } catch (error: any) {
        console.error('Error removing student from grade:', error);
        res.status(500).json({ error: error.message });
    }
});

// ========== CENTER PROFESSORS ==========


// Get professors for a center
app.get('/api/admin/centers/:centerId/professors', async (req, res) => {
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
            .select('id, email, full_name, firstname, lastname')
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

// ========== SUBJECTS ==========

// Create subject
// Create subject
app.post('/api/admin/subjects', async (req, res) => {
    try {
        const {
            name,
            short_name,
            description,
            start_date,
            end_date,
            visibility,
            max_students,
            grade_id
        } = req.body;

        if (!name || !grade_id) {
            return res.status(400).json({ error: 'Name and grade ID are required' });
        }

        const { data, error } = await supabase
            .from('subjects')
            .insert({
                name,
                short_name,
                description,
                start_date: start_date || null,
                end_date: end_date || null,
                visibility,
                max_students,
                grade_id
            })
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

// Get subjects by grade
app.get('/api/admin/grades/:gradeId/subjects', async (req, res) => {
    try {
        const { gradeId } = req.params;

        const { data, error } = await supabase
            .from('subjects')
            .select('*')
            .eq('grade_id', gradeId)
            .order('name');

        if (error) throw error;
        res.json(data || []);
    } catch (error: any) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({
            error: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        });
    }
});

// Get single subject by ID
app.get('/api/admin/subjects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('subjects')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Subject not found' });

        res.json(data);
    } catch (error: any) {
        console.error('Error fetching subject:', error);
        res.status(500).json({ error: error.message });
    }
});

// ========== SUBJECT PROFESSORS ==========

// Get professors for a subject
app.get('/api/admin/subjects/:subjectId/professors', async (req, res) => {
    try {
        const { subjectId } = req.params;

        console.log(`Fetching professors for subject: ${subjectId}`);

        // Get user_ids from junction table
        const { data: relations, error: relationError } = await supabase
            .from('professor_subjects')
            .select('professor_id')
            .eq('subject_id', subjectId);

        if (relationError) throw relationError;

        const userIds = relations?.map(r => r.professor_id) || [];

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
        console.error('Error fetching subject professors:', error);
        // Fallback for missing table
        if (error.code === '42P01') {
            return res.json([]);
        }
        res.status(500).json({ error: error.message });
    }
});

// Assign professor to subject
app.post('/api/admin/subjects/:subjectId/professors', async (req, res) => {
    try {
        const { subjectId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const { data, error } = await supabase
            .from('professor_subjects')
            .insert({ subject_id: subjectId, professor_id: userId })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(400).json({ error: 'Professor already assigned to this subject' });
            }
            throw error;
        }

        res.status(201).json(data);
    } catch (error: any) {
        console.error('Error assigning professor to subject:', error);
        res.status(500).json({ error: error.message });
    }
});

// Unassign professor from subject
app.delete('/api/admin/subjects/:subjectId/professors/:userId', async (req, res) => {
    try {
        const { subjectId, userId } = req.params;

        const { error } = await supabase
            .from('professor_subjects')
            .delete()
            .match({ subject_id: subjectId, user_id: userId });

        if (error) throw error;

        res.json({ message: 'Professor unassigned from subject successfully' });
    } catch (error: any) {
        console.error('Error unassigning professor from subject:', error);
        res.status(500).json({ error: error.message });
    }
});

// ========== COURSE CONTENT (MODULES & ITEMS) ==========

// Get modules for a subject
app.get('/api/admin/subjects/:subjectId/modules', async (req, res) => {
    try {
        const { subjectId } = req.params;

        const { data, error } = await supabase
            .from('modules')
            .select(`
                *,
                items:module_items(*)
            `)
            .eq('subject_id', subjectId)
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
        console.error('Error fetching modules:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create module
app.post('/api/admin/subjects/:subjectId/modules', async (req, res) => {
    try {
        const { subjectId } = req.params;
        const { title, order_index } = req.body;

        const { data, error } = await supabase
            .from('modules')
            .insert({ subject_id: subjectId, title, order_index })
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
            .from('modules')
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
            .from('modules')
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

// ========== HIERARCHY VIEW ==========

// Get complete hierarchy for a center // TODO: see if it broke
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

        // Get grades with subjects
        const { data: grades, error: gradesError } = await supabase
            .from('grades_levels')
            .select(`
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
            // Check if student is enrolled in this grade
            const { data: enrollment } = await supabase
                .from('enrollments')
                .select('id')
                .eq('student_id', userId)
                .eq('grade_id', gradeId)
                .limit(1)
                .maybeSingle();

            if (enrollment) hasAccess = true;
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

// Get aggregated profile details (centers, grades, subjects)
app.get('/api/users/:userId/profile-details', async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.query;

        if (role === 'admin') {
            return res.json({ centers: 'N/A', grades: 'N/A', subjects: 'N/A' });
        }

        let centerNames: string[] = [];
        let gradeNames: string[] = [];
        let subjectNames: string[] = [];

        if (role === 'professor') {
            const { data: profSubjects, error } = await supabase
                .from('professor_subjects')
                .select(`
                    subjects (
                        name,
                        grades_levels (
                            name,
                            educational_centers (name)
                        )
                    )
                `)
                .eq('professor_id', userId);
            
            if (error) throw error;

            profSubjects?.forEach(ps => {
                const sub: any = ps.subjects;
                if (sub) {
                    subjectNames.push(sub.name);
                    if (sub.grades_levels) {
                        gradeNames.push(sub.grades_levels.name);
                        if (sub.grades_levels.educational_centers) {
                            centerNames.push(sub.grades_levels.educational_centers.name);
                        }
                    }
                }
            });
        } else if (role === 'tutor' || role === 'student') {
            let targetStudentIds = [userId];

            if (role === 'tutor') {
                const { data: studentTutors, error: tutorError } = await supabase
                    .from('student_tutors')
                    .select('student_id')
                    .eq('tutor_id', userId);
                if (tutorError) throw tutorError;
                targetStudentIds = studentTutors?.map(st => st.student_id) || [];
            }

            if (targetStudentIds.length > 0) {
                const { data: enrollments, error: enrollError } = await supabase
                    .from('enrollments')
                    .select(`
                        subjects (name),
                        grades_levels (name, educational_centers (name))
                    `)
                    .in('student_id', targetStudentIds);
                
                if (enrollError) throw enrollError;

                enrollments?.forEach(en => {
                    const sub: any = en.subjects;
                    const grade: any = en.grades_levels;
                    if (sub) subjectNames.push(sub.name);
                    if (grade) {
                        gradeNames.push(grade.name);
                        if (grade.educational_centers) {
                            centerNames.push(grade.educational_centers.name);
                        }
                    }
                });
            }
        }

        // Deduplicate
        const uniqueCenters = [...new Set(centerNames)].filter(Boolean);
        const uniqueGrades = [...new Set(gradeNames)].filter(Boolean);
        const uniqueSubjects = [...new Set(subjectNames)].filter(Boolean);

        res.json({
            centers: uniqueCenters.length > 0 ? uniqueCenters.join(', ') : 'N/A',
            grades: uniqueGrades.length > 0 ? uniqueGrades.join(', ') : 'N/A',
            subjects: uniqueSubjects.length > 0 ? uniqueSubjects.join(', ') : 'N/A'
        });

    } catch (error: any) {
        console.error('Error fetching profile details:', error);
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

