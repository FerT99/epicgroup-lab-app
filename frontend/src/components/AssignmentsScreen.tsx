import React, { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'
import { auth } from '../lib/supabase'
import { getUserRole } from '../utils/getUserRole'
import { getProfessorAssignments, getAssignmentSubmissions, updateStudentGrade, type Assignment, type Submission } from '../lib/api'
import TopNavigation from './TopNavigation'
import './AssignmentsScreen.css'

interface AssignmentsScreenProps {
    user: User
}

const AssignmentsScreen: React.FC<AssignmentsScreenProps> = ({ user }) => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [view, setView] = useState<'list' | 'detail'>('list')
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)

    // Data states
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [submissions, setSubmissions] = useState<Submission[]>([])

    // Editing states
    const [editingGradeId, setEditingGradeId] = useState<number | null>(null)
    const [editingGradeValue, setEditingGradeValue] = useState<string>('')

    const displayName = user.user_metadata?.full_name || user.email || 'Usuario'
    const userRole = getUserRole(user)

    useEffect(() => {
        if (view === 'list') {
            loadAssignments()
        }
    }, [view, user.id])

    useEffect(() => {
        if (view === 'detail' && selectedAssignment) {
            loadSubmissions()
        }
    }, [view, selectedAssignment])

    const loadAssignments = async () => {
        try {
            setLoading(true)
            const data = await getProfessorAssignments(user.id)
            setAssignments(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const loadSubmissions = async () => {
        if (!selectedAssignment) return
        try {
            setLoading(true)
            const data = await getAssignmentSubmissions(selectedAssignment.title, selectedAssignment.courseName)
            setSubmissions(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleNavigation = (path: string) => {
        navigate(path)
    }

    const handleLogout = async () => {
        try {
            await auth.signOut()
            navigate('/login')
        } catch (error) {
            console.error(error)
        }
    }

    const handleAssignmentClick = (assignment: Assignment) => {
        setSelectedAssignment(assignment)
        setView('detail')
    }

    const handleBackToList = () => {
        setSelectedAssignment(null)
        setView('list')
    }

    // Grading Logic
    const handleEditGrade = (gradeId: number, currentGrade: number) => {
        setEditingGradeId(gradeId)
        setEditingGradeValue(currentGrade.toString())
    }

    const handleSaveGrade = async (gradeId: number) => {
        const newGrade = parseFloat(editingGradeValue)
        if (isNaN(newGrade) || newGrade < 0) {
            alert('Calificación inválida')
            return
        }

        try {
            await updateStudentGrade(gradeId, newGrade)
            // Update local state
            setSubmissions(prev => prev.map(s =>
                s.gradeId === gradeId
                    ? { ...s, grade: newGrade, status: 'Calificado' }
                    : s
            ))
            setEditingGradeId(null)
        } catch (error) {
            alert('Error al guardar')
        }
    }

    return (
        <div className="assignments-screen">
            <TopNavigation
                activeKey="assignments"
                userDisplayName={displayName}
                userRole={userRole}
                onNavigate={handleNavigation}
                onLogout={handleLogout}
                logoutLoading={false}
                notificationCount={0}
                onOpenNotifications={() => { }}
            />

            <div className="assignments-content">
                <div className="assignments-paper">
                    <div className="assignments-header">
                        {view === 'detail' && (
                            <button className="back-btn" onClick={handleBackToList}>← Volver</button>
                        )}
                        <h1>
                            {view === 'list' ? 'Tareas Pendientes' : selectedAssignment?.title}
                        </h1>
                        {view === 'detail' && <span className="course-badge">{selectedAssignment?.courseName}</span>}
                    </div>

                    {loading ? (
                        <div className="loading">Cargando...</div>
                    ) : view === 'list' ? (
                        <div className="assignments-grid">
                            {assignments.length === 0 ? (
                                <p className="empty-state">No hay tareas pendientes.</p>
                            ) : (
                                assignments.map(assignment => (
                                    <div
                                        key={assignment.id}
                                        className="assignment-card"
                                        onClick={() => handleAssignmentClick(assignment)}
                                    >
                                        <div className="folder-icon">📁</div>
                                        <h3>{assignment.title}</h3>
                                        <p>{assignment.courseName}</p>
                                        <div className="assignment-stats">
                                            <span>Enviados: {assignment.total}</span>
                                            <span className="pending-badge">
                                                Pendientes: {assignment.total - assignment.graded}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="submissions-list">
                            <div className="submissions-header">
                                <span>Estudiante</span>
                                <span>Estado</span>
                                <span>Calificación</span>
                            </div>
                            {submissions.map(sub => (
                                <div key={sub.gradeId} className="submission-row">
                                    <div className="student-info">
                                        <span className="student-name">{sub.studentName}</span>
                                    </div>
                                    <div className={`status-badge ${sub.status === 'Calificado' ? 'done' : 'pending'}`}>
                                        {sub.status}
                                    </div>
                                    <div className="grading-area">
                                        {editingGradeId === sub.gradeId ? (
                                            <div className="edit-box">
                                                <input
                                                    type="number"
                                                    value={editingGradeValue}
                                                    onChange={e => setEditingGradeValue(e.target.value)}
                                                />
                                                <button onClick={() => handleSaveGrade(sub.gradeId)}>💾</button>
                                                <button onClick={() => setEditingGradeId(null)}>❌</button>
                                            </div>
                                        ) : (
                                            <div className="display-box">
                                                <span>{sub.grade !== null ? sub.grade : '-'} / {sub.maxGrade}</span>
                                                <button onClick={() => handleEditGrade(sub.gradeId, sub.grade || 0)}>✏️</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AssignmentsScreen
