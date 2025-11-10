import React, { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'
import { auth } from '../lib/supabase'
import './ProgressScreen.css'
import TopNavigation from './TopNavigation'

interface ProgressScreenProps {
  user: User
}

const ProgressScreen: React.FC<ProgressScreenProps> = ({ user }) => {
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
  // Datos hardcodeados para las 4 cards
  const courses = [
    {
      id: 1,
      title: "NEGOCIOS",
      completedSteps: 2,
      totalSteps: 7
    },
    {
      id: 2,
      title: "INGLÉS",
      completedSteps: 4,
      totalSteps: 7
    },
    {
      id: 3,
      title: "UI/UX",
      completedSteps: 1,
      totalSteps: 7
    },
    {
      id: 4,
      title: "MARKETING",
      completedSteps: 3,
      totalSteps: 7
    }
  ]


  const handleCompleteCourse = (courseId: number) => {
    console.log(`Completando curso ${courseId}`)
    // Redirigir al mapa del curso
    navigate('/course-map')
  }

  return (
    <div className="progress-screen">
      <TopNavigation
        activeKey="progress"
        userDisplayName={user.user_metadata?.full_name || user.email || 'Usuario'}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        logoutLoading={isLoggingOut}
        notificationCount={128}
        onOpenNotifications={() => console.log('Abrir notificaciones')}
      />

      {/* Contenido principal */}
      <div className="progress-content">
        <h1 className="progress-title">Mi Progreso</h1>
        
        {/* Grid de cursos */}
        <div className="courses-grid">
          {courses.map((course) => (
            <div 
              key={course.id} 
              className="course-card"
              onClick={() => handleCompleteCourse(course.id)}
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
                onClick={() => handleCompleteCourse(course.id)}
              >
                Curso completo ►
              </button>
            </div>
          ))}
        </div>
        
        {/* Botón de acción principal */}
        <div className="main-action">
          <button className="main-complete-btn">
            Curso completo ►
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProgressScreen