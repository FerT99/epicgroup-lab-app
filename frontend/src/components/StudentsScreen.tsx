import React, { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'
import { auth } from '../lib/supabase'
import { getUserRole } from '../utils/getUserRole'
import './StudentsScreen.css'
import { getStudentsByProfessor, type Student } from '../lib/api'
import TopNavigation from './TopNavigation'

interface StudentsScreenProps {
    user: User
}


const MOCK_STUDENTS: Student[] = [
    { id: 1, userId: 'mock-1', name: 'Ana García', email: 'ana@example.com', description: 'Excelente participación en clase, siempre atenta y colaborativa with her peers.', color: 'blue' },
    { id: 2, userId: 'mock-2', name: 'Carlos Ruiz', email: 'carlos@example.com', description: 'Necesita mejorar en la entrega de tareas a tiempo, pero muestra gran potencial.', color: 'salmon' },
    { id: 3, userId: 'mock-3', name: 'María López', email: 'maria@example.com', description: 'Muy creativa en proyectos artísticos, destaca por su originalidad.', color: 'green' },
    { id: 4, userId: 'mock-4', name: 'Juan Pérez', email: 'juan@example.com', description: 'Constante y dedicado, ha mostrado una mejora significativa este semestre.', color: 'purple' },
    { id: 5, userId: 'mock-5', name: 'Sofía Díaz', email: 'sofia@example.com', description: 'Liderazgo nato en trabajos en equipo, organiza muy bien a sus compañeros.', color: 'yellow' },
    { id: 6, userId: 'mock-6', name: 'Luis Torres', email: 'luis@example.com', description: 'Actitud positiva frente a los retos, siempre busca aprender más.', color: 'pink' },
]

const StudentsScreen: React.FC<StudentsScreenProps> = ({ user }) => {
    const navigate = useNavigate()
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [students, setStudents] = useState<Student[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch students on mount
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setLoading(true)
                setError(null)
                // Intentamos cargar los alumnos reales
                const data = await getStudentsByProfessor(user.id)

                // Si hay datos, los usamos. Si no, usamos los datos mock para visualización.
                if (data && data.length > 0) {
                    setStudents(data)
                } else {
                    console.log('No students found, using mock data')
                    setStudents(MOCK_STUDENTS)
                }
            } catch (err: any) {
                console.error('Error fetching students:', err)
                // En caso de error, también mostramos los mocks para que el usuario pueda ver el diseño
                console.log('Error fetching, using mock data fallback')
                setStudents(MOCK_STUDENTS)
            } finally {
                setLoading(false)
            }
        }

        fetchStudents()
    }, [user.id])

    const handleNavigation = (path: string) => {
        navigate(path)
    }

    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            await auth.signOut()
            navigate('/login')
        } catch (error) {
            console.error('Error al cerrar sesión:', error)
        } finally {
            setIsLoggingOut(false)
        }
    }

    // Splitting for columns
    const leftStudents = students.slice(0, Math.ceil(students.length / 2))
    const rightStudents = students.slice(Math.ceil(students.length / 2))
    const displayName = user.user_metadata?.full_name || user.email || 'Usuario'
    const userRole = getUserRole(user)

    return (
        <div className="students-screen">
            <TopNavigation
                activeKey="reminder"
                userDisplayName={displayName}
                userRole={userRole}
                onNavigate={handleNavigation}
                onLogout={handleLogout}
                logoutLoading={loading}
                notificationCount={0}
                onOpenNotifications={() => console.log('Abrir notificaciones')}
            />

            <div className="students-content">
                {/* Main Paper Container */}
                <div className="paper-container">
                    {/* Header Pill */}
                    <div className="header-pill">
                        <h1>Mis alumnos</h1>
                    </div>

                    <div className="spiral-binding">
                        {/* Decorative dots/spiral */}
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="spiral-dot"></div>
                        ))}
                    </div>


                    <div className="students-grid">
                        {loading ? (
                            <div className="empty-state">
                                <p>Cargando alumnos...</p>
                            </div>
                        ) : error ? (
                            <div className="empty-state">
                                <p>Error: {error}</p>
                                <p className="empty-state-subtitle">Intenta recargar la página</p>
                            </div>
                        ) : students.length === 0 ? (
                            <div className="empty-state">
                                <p>No hay alumnos registrados</p>
                                <p className="empty-state-subtitle">Los alumnos aparecerán aquí cuando se inscriban en tus cursos</p>
                            </div>
                        ) : (
                            <>
                                <div className="students-column">
                                    {leftStudents.map((student) => (
                                        <div
                                            key={student.id}
                                            className={`student-card ${student.color}`}
                                            onClick={() => navigate(`/alumnos/${student.userId}`, {
                                                state: {
                                                    studentData: {
                                                        id: student.userId,
                                                        name: student.name,
                                                        email: student.email,
                                                        courses: [],
                                                        grades: [],
                                                        comments: []
                                                    }
                                                }
                                            })}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="student-number">{String(student.id).padStart(2, '0')}</div>
                                            <div className="student-info">
                                                <h3>{student.name}</h3>
                                                <p>{student.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="students-column">
                                    {rightStudents.map((student) => (
                                        <div
                                            key={student.id}
                                            className={`student-card ${student.color}`}
                                            onClick={() => navigate(`/alumnos/${student.userId}`, {
                                                state: {
                                                    studentData: {
                                                        id: student.userId,
                                                        name: student.name,
                                                        email: student.email,
                                                        courses: [],
                                                        grades: [],
                                                        comments: []
                                                    }
                                                }
                                            })}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="student-number">{String(student.id).padStart(2, '0')}</div>
                                            <div className="student-info">
                                                <h3>{student.name}</h3>
                                                <p>{student.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Decorative Elements (Stickers) */}
                <div className="sticker-laptop">
                    <div className="laptop-screen">
                        <span>TODAY'S</span>
                        <span>WORK</span>
                    </div>
                    <div className="laptop-base"></div>
                </div>

                <div className="sticker-idea">
                    <div className="bulb-icon">💡</div>
                    <div className="window-icon"></div>
                </div>

                {/* Decorative Arms (simplified CSS shapes) */}
                <div className="arm-left"></div>
                <div className="arm-right"></div>

                {/* Ver Calificaciones Button - Bottom Right */}
                <button className="view-grades-btn" onClick={() => navigate('/calificaciones')}>
                    Ver Calificaciones
                </button>
            </div>
        </div>
    )
}

export default StudentsScreen
