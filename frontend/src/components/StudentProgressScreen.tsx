import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { auth } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
import { getStudentProgress, addStudentComment, updateComment, deleteComment, type StudentData } from '../lib/api'
import astronautUrl from '../assets/astronauta.png'
import './StudentProgressScreen.css'

interface StudentProgressScreenProps {
    user: User
}

const StudentProgressScreen: React.FC<StudentProgressScreenProps> = ({ user }) => {
    const [loading, setLoading] = useState(false)
    const [dataLoading, setDataLoading] = useState(true)
    const [newComment, setNewComment] = useState('')
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
    const [editingCommentText, setEditingCommentText] = useState('')
    const [studentData, setStudentData] = useState<StudentData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()
    const { studentId } = useParams()
    const location = useLocation()

    // Fetch student data on mount
    useEffect(() => {
        const fetchStudentData = async () => {
            if (!studentId) {
                setError('No student ID provided')
                setDataLoading(false)
                return
            }

            try {
                setDataLoading(true)
                setError(null)

                // Try to get data from location state first, otherwise fetch from API
                if (location.state?.studentData) {
                    // If we have basic data from navigation, fetch full data from API
                    const data = await getStudentProgress(studentId)
                    setStudentData(data)
                } else {
                    // Fetch from API
                    const data = await getStudentProgress(studentId)
                    setStudentData(data)
                }
            } catch (err: any) {
                console.error('Error fetching student data:', err)
                setError(err.message || 'Error al cargar los datos del alumno')

                // Fallback to location state if API fails
                if (location.state?.studentData) {
                    setStudentData(location.state.studentData)
                }
            } finally {
                setDataLoading(false)
            }
        }

        fetchStudentData()
    }, [studentId, location.state])

    const handleLogout = async () => {
        setLoading(true)
        try {
            await auth.signOut()
            navigate('/login')
        } catch (error) {
            console.error('Error al cerrar sesión:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleBackToStudents = () => {
        navigate('/alumnos')
    }

    const handleAddComment = async () => {
        if (!newComment.trim() || !studentId) return

        try {
            const authorName = user.user_metadata?.full_name || user.email || 'Profesor'
            const comment = await addStudentComment(studentId, newComment, user.id, authorName)

            // Update local state
            setStudentData(prev => prev ? {
                ...prev,
                comments: [comment, ...prev.comments]
            } : null)

            setNewComment('')
        } catch (err: any) {
            console.error('Error adding comment:', err)
            alert('Error al agregar el comentario')
        }
    }

    const handleEditComment = (commentId: number) => {
        const comment = studentData?.comments.find(c => c.id === commentId)
        if (comment) {
            setEditingCommentId(commentId)
            setEditingCommentText(comment.text)
        }
    }

    const handleSaveComment = async () => {
        if (!editingCommentText.trim() || editingCommentId === null) return

        try {
            const updatedComment = await updateComment(editingCommentId, editingCommentText, user.id)

            // Update local state
            setStudentData(prev => prev ? {
                ...prev,
                comments: prev.comments.map(c =>
                    c.id === editingCommentId ? updatedComment : c
                )
            } : null)

            setEditingCommentId(null)
            setEditingCommentText('')
        } catch (err: any) {
            console.error('Error updating comment:', err)
            alert('Error al actualizar el comentario')
        }
    }

    const handleDeleteComment = async (commentId: number) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este comentario?')) return

        try {
            await deleteComment(commentId, user.id)

            // Update local state
            setStudentData(prev => prev ? {
                ...prev,
                comments: prev.comments.filter(c => c.id !== commentId)
            } : null)
        } catch (err: any) {
            console.error('Error deleting comment:', err)
            alert('Error al eliminar el comentario')
        }
    }

    const calculateAverageGrade = () => {
        if (!studentData || studentData.grades.length === 0) return 0
        const sum = studentData.grades.reduce((acc, grade) => acc + (grade.grade / grade.maxGrade) * 100, 0)
        return (sum / studentData.grades.length).toFixed(1)
    }

    // Loading state
    if (dataLoading) {
        return (
            <div className="student-progress-screen">
                <div className="loading-container" style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    color: 'white',
                    fontSize: '18px'
                }}>
                    Cargando datos del alumno...
                </div>
            </div>
        )
    }

    // Error state
    if (error && !studentData) {
        return (
            <div className="student-progress-screen">
                <div className="error-container" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    color: 'white',
                    gap: '20px'
                }}>
                    <p style={{ fontSize: '18px' }}>Error: {error}</p>
                    <button
                        onClick={handleBackToStudents}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#8c52ff',
                            color: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        Volver a Alumnos
                    </button>
                </div>
            </div>
        )
    }

    if (!studentData) {
        return null
    }

    return (
        <div className="student-progress-screen">
            {/* Background Ornaments */}
            <div className="bg-ornament ornament-1"></div>
            <div className="bg-ornament ornament-2"></div>
            <div className="character-circle"></div>

            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-profile">
                    <div className="profile-avatar-wrapper">
                        <img src={studentData.avatar || astronautUrl} alt="Student Profile" />
                    </div>
                    <h2 className="sidebar-name">{studentData.name}</h2>
                    <p className="sidebar-email">{studentData.email}</p>
                </div>

                <nav className="sidebar-menu">
                    <div className="menu-item active">
                        <div className="menu-icon-circle">
                            <span style={{ fontSize: '14px' }}>📊</span>
                        </div>
                        <span className="menu-label">Progreso</span>
                    </div>
                </nav>

                <div className="logout-container">
                    <button className="btn-back" onClick={handleBackToStudents}>
                        ← Volver a Alumnos
                    </button>
                    <button className="btn-logout" onClick={handleLogout} disabled={loading}>
                        {loading ? 'Cerrando...' : 'Cerrar Sesión'}
                    </button>
                </div>
            </aside>

            {/* Decorative Character (Top Right) */}
            <div className="character-float">
                <img src={astronautUrl} alt="Character Decoration" style={{ width: '100%', opacity: 0.9 }} />
            </div>

            {/* Main Content */}
            <main className="main-content">
                <header className="header-section">
                    <h1 className="academic-title">
                        Progreso <span>individual</span>
                    </h1>
                    <div className="header-underline"></div>
                </header>

                <div className="dashboard-grid">
                    {/* Left Column */}
                    <div className="left-column">
                        {/* Cursos del alumno */}
                        <div className="card">
                            <span className="section-subtitle">Cursos inscritos</span>
                            <h3 className="section-title">Cursos</h3>

                            <div className="courses-list">
                                {studentData.courses.length === 0 ? (
                                    <p className="empty-message">No hay cursos asignados</p>
                                ) : (
                                    studentData.courses.map((course) => (
                                        <div key={course.id} className="course-progress-item">
                                            <div className="course-info">
                                                <span className="course-name">{course.name}</span>
                                                <span className="course-progress-text">{course.progress}%</span>
                                            </div>
                                            <div className="course-progress-bar">
                                                <div
                                                    className={`course-progress-fill ${course.color}`}
                                                    style={{ width: `${course.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Calificaciones */}
                        <div className="card">
                            <span className="section-subtitle">Rendimiento académico</span>
                            <h3 className="section-title">Calificaciones</h3>

                            <div className="grades-summary">
                                <div className="average-grade">
                                    <span className="average-label">Promedio General</span>
                                    <span className="average-value">{calculateAverageGrade()}%</span>
                                </div>

                                <div className="grades-list">
                                    {studentData.grades.length === 0 ? (
                                        <p className="empty-message">No hay calificaciones registradas</p>
                                    ) : (
                                        studentData.grades.map((grade, index) => (
                                            <div key={index} className="grade-item">
                                                <span className="grade-course">{grade.courseName}</span>
                                                <span className="grade-value">
                                                    {grade.grade}/{grade.maxGrade}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="right-column">
                        <div className="comments-section">
                            <div className="comments-header">
                                <h2 className="comments-title">Notas y Comentarios</h2>
                            </div>

                            <div className="card comments-card">
                                {/* Add Comment Section */}
                                <div className="add-comment-section">
                                    <h3 className="section-title">Agregar Nota</h3>
                                    <textarea
                                        className="comment-input"
                                        placeholder="Escribe una nota o comentario sobre el alumno..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        rows={4}
                                    />
                                    <button className="add-comment-btn" onClick={handleAddComment}>
                                        Agregar Comentario
                                    </button>
                                </div>

                                {/* Comments List */}
                                <div className="comments-list">
                                    <h3 className="section-title">Historial de Notas</h3>
                                    {studentData.comments.length === 0 ? (
                                        <p className="empty-message">No hay comentarios registrados</p>
                                    ) : (
                                        studentData.comments.map((comment) => (
                                            <div key={comment.id} className="comment-item">
                                                {editingCommentId === comment.id ? (
                                                    <div className="edit-comment-section">
                                                        <textarea
                                                            className="comment-input"
                                                            value={editingCommentText}
                                                            onChange={(e) => setEditingCommentText(e.target.value)}
                                                            rows={3}
                                                        />
                                                        <div className="comment-actions">
                                                            <button className="save-btn" onClick={handleSaveComment}>
                                                                Guardar
                                                            </button>
                                                            <button
                                                                className="cancel-btn"
                                                                onClick={() => setEditingCommentId(null)}
                                                            >
                                                                Cancelar
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="comment-header">
                                                            <span className="comment-author">{comment.author}</span>
                                                            <span className="comment-date">{comment.date}</span>
                                                        </div>
                                                        <p className="comment-text">{comment.text}</p>
                                                        <div className="comment-actions">
                                                            <button
                                                                className="edit-btn"
                                                                onClick={() => handleEditComment(comment.id)}
                                                            >
                                                                ✏️ Editar
                                                            </button>
                                                            <button
                                                                className="delete-btn"
                                                                onClick={() => handleDeleteComment(comment.id)}
                                                            >
                                                                🗑️ Eliminar
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default StudentProgressScreen
