import React, { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'
import { auth } from '../lib/supabase'
import './ProgressScreen.css'
import TopNavigation from './TopNavigation'
import tareasPdf from '../pdfs/AMPLIACIÓNTEMA6.1TAREASALUMNOS.pdf'

interface ProgressScreenProps {
  user: User
}

// Función helper para detectar si el usuario es profesor
const isProfessor = (user: User): boolean => {
  const roleCandidates = [
    ...(Array.isArray(user.app_metadata?.roles) ? user.app_metadata.roles : []),
    ...(Array.isArray(user.user_metadata?.roles) ? user.user_metadata.roles : []),
  ]

  const primaryRole =
    (typeof user.app_metadata?.role === 'string' && user.app_metadata.role) ||
    (typeof user.user_metadata?.role === 'string' && user.user_metadata.role) ||
    undefined

  const normalizedRoles = roleCandidates
    .filter((role) => role !== null && role !== undefined)
    .map((role) => String(role).toLowerCase().trim())

  const normalizedPrimaryRole = primaryRole?.toLowerCase().trim()

  const metadataRole = (() => {
    const roleFromUserMetadata = typeof user.user_metadata?.role === 'string' ? user.user_metadata.role : undefined
    const roleFromAppMetadata = typeof user.app_metadata?.role === 'string' ? user.app_metadata.role : undefined
    return (
      roleFromUserMetadata?.toLowerCase().trim() ||
      roleFromAppMetadata?.toLowerCase().trim()
    )
  })()

  const professorAliases = ['professor', 'teacher', 'profesor', 'docente']

  return (
    normalizedRoles.some((role) => professorAliases.includes(role)) ||
    (normalizedPrimaryRole ? professorAliases.includes(normalizedPrimaryRole) : false) ||
    (metadataRole ? professorAliases.includes(metadataRole) : false) ||
    user.user_metadata?.is_professor === false
  )
}

const ProgressScreen: React.FC<ProgressScreenProps> = ({ user }) => {
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Detectar si es profesor (hardcodeado por ahora para demostración)
  // Para pruebas, puedes cambiar ENABLE_PROFESSOR_MODE a true para forzar la vista de profesor
  const ENABLE_PROFESSOR_MODE = true // Cambiar a false para usar la detección real
  const userIsProfessor = ENABLE_PROFESSOR_MODE || isProfessor(user) || user.email?.includes('profesor') || user.email?.includes('teacher')

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
      totalSteps: 7,
      resources: {
        1: tareasPdf
      }
    },
    {
      id: 2,
      title: "INGLÉS",
      completedSteps: 4,
      totalSteps: 7,
      resources: {
        1: 'https://www.africau.edu/images/default/sample.pdf'
      }
    },
    {
      id: 3,
      title: "UI/UX",
      completedSteps: 1,
      totalSteps: 7,
      resources: {
        1: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf'
      }
    },
    {
      id: 4,
      title: "MARKETING",
      completedSteps: 3,
      totalSteps: 7,
      resources: {
        1: 'https://file-examples.com/storage/fe630daaa009f173c5140d0/2017/10/file-sample_150kB.pdf'
      }
    }
  ]


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
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        logoutLoading={isLoggingOut}
        notificationCount={128}
        onOpenNotifications={() => console.log('Abrir notificaciones')}
      />

      {/* Contenido principal */}
      <div className="progress-content">
        <h1 className="progress-title">Mis cursos</h1>

        {/* Grid de cursos */}
        <div className="courses-grid">
          {courses.map((course) => (
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
          ))}
        </div>

        {/* Botón de acción principal */}
        <div className="main-action">
          <button className="main-complete-btn">
            Curso completo ►
          </button>
        </div>

        {/* Sección "Mis cursos" para profesores */}
        {userIsProfessor && (
          <div className="professor-courses-section">
            <h2 className="professor-section-title">Mis cursos</h2>
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