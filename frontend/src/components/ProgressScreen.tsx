import React, { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'
import { auth } from '../lib/supabase'
import { getUserRole } from '../utils/getUserRole'
import './ProgressScreen.css'
import TopNavigation from './TopNavigation'


interface ProgressScreenProps {
  user: User
}

const ProgressScreen: React.FC<ProgressScreenProps> = ({ user }) => {
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Get user role using utility function
  const userRole = getUserRole(user)


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
  // TODO: Fetch courses from backend
  const courses: Array<{
    id: number
    title: string
    completedSteps: number
    totalSteps: number
    resources: Record<number, string>
  }> = []


  const handleOpenCourse = (course: (typeof courses)[number]) => {
    navigate('/course-map', {
      state: {
        courseId: course.id,
        courseTitle: course.title,
        planetResources: course.resources ?? undefined
      }
    })
  }

  return (
    <div className="progress-screen">
      <TopNavigation
        activeKey="progress"
        userDisplayName={user.user_metadata?.full_name || user.email || 'Usuario'}
        userRole={userRole}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        logoutLoading={isLoggingOut}
        notificationCount={0} // TODO: Fetch from backend
        onOpenNotifications={() => console.log('Abrir notificaciones')}
      />

      {/* Contenido principal */}
      <div className="progress-content">
        <h1 className="progress-title">Mis cursos</h1>


        {/* Grid de cursos */}
        <div className="courses-grid">
          {courses.length === 0 ? (
            <div className="empty-state">
              <p>No hay cursos disponibles</p>
            </div>
          ) : (
            courses.map((course) => (
              <div
                key={course.id}
                className="course-card"
                onClick={() => handleOpenCourse(course)}
              >
                <h3 className="course-title">{course.title}</h3>

                {/* Barra de progreso */}
                <div className="progress-bar">
                  {Array.from({ length: course.totalSteps }, (_, index) => {
                    const stepNumber = index + 1
                    const isCompleted = stepNumber <= course.completedSteps

                    return (
                      <div key={stepNumber} className="progress-step-container">
                        <div className={`progress-step ${isCompleted ? 'completed' : 'pending'}`}>
                          <span className="step-number">{stepNumber.toString().padStart(2, '0')}</span>
                        </div>
                        {index < course.totalSteps - 1 && (
                          <div className={`progress-line ${isCompleted ? 'completed' : 'pending'}`}></div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Botón de curso completo */}
                <button
                  className="complete-course-btn"
                  onClick={() => handleOpenCourse(course)}
                >
                  Curso completo ►
                </button>
              </div>
            ))
          )}
        </div>

        {/* Botón de acción principal */}
        <div className="main-action">
          <button className="main-complete-btn">
            Curso completo ►
          </button>
        </div>

        {/* Sección "Mis cursos" para administradores */}
        {userRole === 'admin' && (
          <div className="professor-courses-section">
            <h2 className="professor-section-title">Gestión de Contenido</h2>
            <div className="professor-courses-content">
              <button
                className="upload-content-btn"
                onClick={() => navigate('/upload-content')}
              >
                Subir contenido
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProgressScreen