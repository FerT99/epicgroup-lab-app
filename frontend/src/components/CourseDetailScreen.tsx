import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { User } from '@supabase/supabase-js'
import TopNavigation from './TopNavigation'
import { getUserRole } from '../utils/getUserRole'
import { auth } from '../lib/supabase'
import { getSectionById, Section } from '../lib/adminApi'
import './DashboardScreen.css' // Reusing dashboard styles for consistency

interface CourseDetailScreenProps {
    user: User
}

const CourseDetailScreen: React.FC<CourseDetailScreenProps> = ({ user }) => {
    const { courseId } = useParams<{ courseId: string }>()
    const navigate = useNavigate()
    const userRole = getUserRole(user)

    const [section, setSection] = useState<Section | null>(null)
    const [grade, setGrade] = useState<{ center_id: string } | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Professors state
    const [professors, setProfessors] = useState<any[]>([])
    const [showProfessorModal, setShowProfessorModal] = useState(false)

    useEffect(() => {
        if (courseId) {
            loadSection(courseId)
            loadProfessors(courseId)
        }
    }, [courseId])

    const loadSection = async (id: string) => {
        try {
            setLoading(true)
            const data = await getSectionById(id)
            setSection(data)

            // Fetch grade to get center_id
            if (data.grade_id) {
                const { getGradeById } = await import('../lib/adminApi')
                const gradeData = await getGradeById(data.grade_id)
                setGrade(gradeData)
            }
        } catch (err: any) {
            setError(err.message || 'Error al cargar el curso')
        } finally {
            setLoading(false)
        }
    }

    const loadProfessors = async (id: string) => {
        try {
            const { getSectionProfessors } = await import('../lib/adminApi')
            const data = await getSectionProfessors(id)
            setProfessors(data)
        } catch (error) {
            console.error('Error loading professors:', error)
        }
    }

    const handleAssignProfessor = async (userId: string) => {
        if (!courseId) return
        try {
            const { assignSectionProfessor } = await import('../lib/adminApi')
            await assignSectionProfessor(courseId, userId)
            await loadProfessors(courseId)
            setShowProfessorModal(false)
        } catch (error: any) {
            alert('Error asignando profesor: ' + error.message)
        }
    }

    const handleUnassignProfessor = async (userId: string) => {
        if (!courseId || !confirm('¿Estás seguro de quitar a este profesor del curso?')) return
        try {
            const { unassignSectionProfessor } = await import('../lib/adminApi')
            await unassignSectionProfessor(courseId, userId)
            await loadProfessors(courseId)
        } catch (error: any) {
            alert('Error : ' + error.message)
        }
    }

    const handleNavigate = (path: string) => {
        navigate(path)
    }

    const handleLogout = async () => {
        await auth.signOut()
    }

    if (loading) {
        return (
            <div className="dashboard-screen">
                <TopNavigation
                    activeKey="courses"
                    userDisplayName={user.user_metadata?.full_name || user.email || 'Usuario'}
                    userRole={userRole}
                    onNavigate={handleNavigate}
                    onLogout={handleLogout}
                />
                <div className="dashboard-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                    <p>Cargando curso...</p>
                </div>
            </div>
        )
    }

    if (error || !section) {
        return (
            <div className="dashboard-screen">
                <TopNavigation
                    activeKey="courses"
                    userDisplayName={user.user_metadata?.full_name || user.email || 'Usuario'}
                    userRole={userRole}
                    onNavigate={handleNavigate}
                    onLogout={handleLogout}
                />
                <div className="dashboard-content" style={{ padding: '2rem', textAlign: 'center' }}>
                    <h2>❌ Error</h2>
                    <p>{error || 'No se encontró el curso'}</p>
                    <button className="level-up-btn" onClick={() => navigate('/progress')}>Volver</button>
                </div>
            </div>
        )
    }

    const ProfessorAssignmentModal = React.lazy(() => import('./ProfessorAssignmentModal'))

    return (
        <div className="dashboard-screen">
            <TopNavigation
                activeKey="courses"
                userDisplayName={user.user_metadata?.full_name || user.email || 'Usuario'}
                userRole={userRole}
                onNavigate={handleNavigate}
                onLogout={handleLogout}
            />

            <div className="dashboard-content">
                <div className="welcome-section" style={{ minHeight: 'auto', padding: '3rem 2rem' }}>
                    <div className="welcome-content">
                        <div className="welcome-text">
                            <span className="medal-icon" style={{ fontSize: '1.5rem', display: 'block', marginBottom: '1rem' }}>📚</span>
                            <h1 className="welcome-title">{section.name}</h1>
                            {section.short_name && <h2 className="user-name" style={{ fontSize: '1.5rem', opacity: 0.9 }}>{section.short_name}</h2>}
                            <p className="progress-text" style={{ maxWidth: '600px', marginTop: '1rem' }}>
                                {section.description || 'Sin descripción disponible.'}
                            </p>

                            <div className="progress-info" style={{ marginTop: '2rem' }}>
                                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '12px', marginRight: '10px' }}>
                                    <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.8 }}>Inicio</span>
                                    <strong>{section.start_date ? new Date(section.start_date).toLocaleDateString() : 'N/A'}</strong>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '12px' }}>
                                    <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.8 }}>Fin</span>
                                    <strong>{section.end_date ? new Date(section.end_date).toLocaleDateString() : 'N/A'}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

                    {/* Professors Section */}
                    {userRole === 'admin' && ( // Only admins see this for now, or allow logic check
                        <div style={{ marginBottom: '3rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'white' }}>👨‍🏫 Profesores</h3>
                                <button
                                    className="action-btn"
                                    onClick={() => setShowProfessorModal(true)}
                                    style={{ background: '#6c5ce7', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <span>+</span> Asignar Profesor
                                </button>
                            </div>

                            {professors.length === 0 ? (
                                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '2rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                    <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0 }}>No hay profesores asignados a este curso.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                                    {professors.map(prof => (
                                        <div key={prof.id} style={{
                                            background: '#2d2d44',
                                            borderRadius: '16px',
                                            padding: '1.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '1rem',
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{
                                                    width: '48px', height: '48px',
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '1.2rem', fontWeight: 'bold', color: 'white'
                                                }}>
                                                    {prof.full_name?.charAt(0) || 'P'}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 'bold', color: 'white' }}>{prof.full_name || 'Profesor'}</div>
                                                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>{prof.email}</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleUnassignProfessor(prof.id)}
                                                style={{ background: 'rgba(255,59,48,0.1)', color: '#ff3b30', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}
                                                title="Remover profesor"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Placeholder for course content */}
                    <div className="empty-state" style={{
                        background: '#1e1e2e',
                        borderRadius: '24px',
                        padding: '3rem',
                        textAlign: 'center',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚧</div>
                        <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Contenido del Curso</h3>
                        <p style={{ color: 'rgba(255,255,255,0.6)' }}>Próximamente podrás ver el contenido detallado aquí.</p>
                    </div>
                </div>

                <React.Suspense fallback={null}>
                    {showProfessorModal && courseId && section && grade && (
                        <ProfessorAssignmentModal
                            isOpen={showProfessorModal}
                            onClose={() => setShowProfessorModal(false)}
                            onAssign={handleAssignProfessor}
                            centerId={grade.center_id}
                            currentProfessorIds={professors.map(p => p.id)}
                        />
                    )}
                </React.Suspense>
            </div>
        </div>
    )
}

export default CourseDetailScreen
