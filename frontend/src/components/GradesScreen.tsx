import React, { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'
import './GradesScreen.css'
import { auth } from '../lib/supabase'
import { getUserRole } from '../utils/getUserRole'
import TopNavigation from './TopNavigation'

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


    // TODO: Fetch student grades from backend
    const studentGrades: Array<{
        id: number
        name: string
        color: string
        icon: string
        grade: string
        gradeText: string
    }> = []

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
                            studentGrades.map((student) => (
                                <div key={student.id} className="grade-row">
                                    {/* Student Card */}
                                    <div className={`grade-student-card ${student.color}`}>
                                        <div className="grade-student-number">{String(student.id).padStart(2, '0')}</div>
                                        <div className="grade-student-info">
                                            <h3>{student.name}</h3>
                                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed.</p>
                                        </div>
                                    </div>

                                    {/* Icon Badge */}
                                    <div className="grade-icon-badge">
                                        <img src={`/src/assets/${student.icon}`} alt="Badge" />
                                    </div>

                                    {/* Grade Card */}
                                    <div className="grade-card">
                                        <h4>CALIFICACIÓN</h4>
                                        <div className="grade-score">{student.grade}</div>
                                        <p>{student.gradeText}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="grades-sticker-spaceship">
                    <img src="/src/assets/spaceship.png" alt="Spaceship" />
                </div>

                <div className="grades-sticker-laptop">
                    <img src="/src/assets/lap.png" alt="Laptop" />
                </div>

                <div className="grades-sticker-pencil">
                    <img src="/src/assets/pencil.png" alt="Pencil" />
                </div>

                {/* Decorative circles */}
                <div className="grades-purple-circle"></div>
                <div className="grades-yellow-circle"></div>
            </div>
        </div>
    )
}

export default GradesScreen
