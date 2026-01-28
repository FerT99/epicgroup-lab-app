import React, { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'
import './GradesScreen.css'
import { auth } from '../lib/supabase'
import { getUserRole } from '../utils/getUserRole'
import { getProfessorGradesSummary, type GradeSummary } from '../lib/api'
import TopNavigation from './TopNavigation'
import pencilIcon from '../assets/pencil.png'
import lapIcon from '../assets/lap.png'
import spaceshipIcon from '../assets/spaceship.png'

interface GradesScreenProps {
    user: User
}

const GradesScreen: React.FC<GradesScreenProps> = ({ user }) => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    const handleNavigation = (path: string) => {
        navigate(path)
    }

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


    const [studentGrades, setStudentGrades] = useState<GradeSummary[]>([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const data = await getProfessorGradesSummary(user.id)
                setStudentGrades(data)
            } catch (error) {
                console.error('Error loading grades:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user.id])

    // Helper to get random icon (since backend doesn't provide it yet)
    const getIcon = (index: number) => {
        const icons = [pencilIcon, lapIcon, spaceshipIcon]
        return icons[index % icons.length]
    }

    const getGradeText = (avg: number) => {
        if (avg >= 90) return '¡Excelente trabajo!'
        if (avg >= 80) return 'Muy buen desempeño'
        if (avg >= 70) return 'Buen desempeño'
        if (avg >= 60) return 'Suficiente'
        return 'Necesita mejorar'
    }

    const displayName = user.user_metadata?.full_name || user.email || 'Usuario'
    const userRole = getUserRole(user)

    return (
        <div className="grades-screen">
            <TopNavigation
                activeKey="grades"
                userDisplayName={displayName}
                userRole={userRole}
                onNavigate={handleNavigation}
                onLogout={handleLogout}
                logoutLoading={loading}
                notificationCount={0} // TODO: Fetch from backend
                onOpenNotifications={() => console.log('Abrir notificaciones')}
            />

            <div className="grades-content">
                {/* Main Paper Container */}
                <div className="grades-paper-container">
                    {/* Header Pill */}
                    <div className="grades-header-pill">
                        <h1>Calificaciones</h1>
                    </div>


                    {/* Student Grades List */}
                    <div className="grades-list">
                        {studentGrades.length === 0 ? (
                            <div className="empty-state">
                                <p>No hay calificaciones registradas</p>
                                <p className="empty-state-subtitle">Las calificaciones aparecerán aquí cuando se carguen desde el backend</p>
                            </div>
                        ) : (
                            studentGrades.map((student, index) => (
                                <div key={student.id} className="grade-row">
                                    {/* Student Card */}
                                    <div className={`grade-student-card ${student.color}`}>
                                        <div className="grade-student-number">{String(student.id).padStart(2, '0')}</div>
                                        <div className="grade-student-info">
                                            <h3>{student.name}</h3>
                                            <p>{student.email}</p>
                                        </div>
                                    </div>

                                    {/* Icon Badge */}
                                    <div className="grade-icon-badge">
                                        <img src={getIcon(index)} alt="Badge" />
                                    </div>

                                    {/* Grade Card */}
                                    <div className="grade-card">
                                        <h4>PROMEDIO</h4>
                                        <div className="grade-score">{student.average}%</div>
                                        <p>{getGradeText(student.average)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="grades-sticker-spaceship">
                    <img src={spaceshipIcon} alt="Spaceship" />
                </div>

                <div className="grades-sticker-laptop">
                    <img src={lapIcon} alt="Laptop" />
                </div>

                <div className="grades-sticker-pencil">
                    <img src={pencilIcon} alt="Pencil" />
                </div>

                {/* Decorative circles */}
                <div className="grades-purple-circle"></div>
                <div className="grades-yellow-circle"></div>
            </div>
        </div>
    )
}

export default GradesScreen
