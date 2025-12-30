import React, { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'
import './StudentsScreen.css'
import { auth } from '../lib/supabase'
import TopNavigation from './TopNavigation'

interface StudentsScreenProps {
    user: User
}

const StudentsScreen: React.FC<StudentsScreenProps> = ({ user }) => {
    const navigate = useNavigate()
    const [isLoggingOut, setIsLoggingOut] = useState(false)

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

    const students = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `ALUMNO ${String(i + 1).padStart(2, '0')}`,
        description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed.',
        color: i < 5 ? 'orange' : 'salmon' // Alternate visually between columns roughly
    }))

    // Splitting for columns
    const leftStudents = students.slice(0, 5)
    const rightStudents = students.slice(5, 10)

    return (
        <div className="students-screen">
            <TopNavigation
                activeKey="reminder" // 'reminder' key mapped to 'Alumnos' in nav items
                userDisplayName={user.user_metadata?.full_name || user.email || 'Usuario'}
                onNavigate={handleNavigation}
                onLogout={handleLogout}
                logoutLoading={isLoggingOut}
                notificationCount={42}
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
                        <div className="students-column">
                            {leftStudents.map((student) => (
                                <div key={student.id} className="student-card orange">
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
                                <div key={student.id} className="student-card salmon">
                                    <div className="student-number">{String(student.id).padStart(2, '0')}</div>
                                    <div className="student-info">
                                        <h3>{student.name}</h3>
                                        <p>{student.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
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
            </div>
        </div>
    )
}

export default StudentsScreen
