import React, { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { auth } from '../lib/supabase'
import { getUserRole } from '../utils/getUserRole'
import TopNavigation from './TopNavigation'
import './CoursePdfViewerScreen.css'
import type { User } from '@supabase/supabase-js'
import pencilImage from '../assets/pencil.png'
import spaceshipImage from '../assets/spaceship.png'

interface CoursePdfViewerScreenProps {
  user: User
}

interface LocationState {
  pdfUrl?: string
  title?: string
}

// Descripciones de los cursos
const courseDescriptions: Record<string, string> = {
  'Módulo 8 · Ampliación Tema 8.1': 'Sigue construyendo tu idea de negocio aplicando el conocimiento adquirido. Trabajarás en competencias, análisis DAFO, imagen corporativa, diseño de logo, naming y eslogan. Aprenderás a analizar el perfil de cliente/usuario, situar tu proyecto en un océano azul o rojo, y entender el impacto de la innovación en valor. Además, afianzarás conceptos clave y resolverás dudas para avanzar hacia tu primera ronda de inversión.',
  'AMPLIACIÓN TEMA 8.1': 'Sigue construyendo tu idea de negocio aplicando el conocimiento adquirido. Trabajarás en competencias, análisis DAFO, imagen corporativa, diseño de logo, naming y eslogan. Aprenderás a analizar el perfil de cliente/usuario, situar tu proyecto en un océano azul o rojo, y entender el impacto de la innovación en valor. Además, afianzarás conceptos clave y resolverás dudas para avanzar hacia tu primera ronda de inversión.',
  'default': 'Explora este curso y descubre todo lo que necesitas para avanzar en tu aprendizaje. Aprende conceptos clave, desarrolla nuevas habilidades y alcanza tus objetivos educativos.'
}

const CoursePdfViewerScreen: React.FC<CoursePdfViewerScreenProps> = ({ user }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { courseId } = useParams()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const { title } = (location.state as LocationState) || {}
  const courseTitle = title || 'Conoce tu agenda'
  const courseDescription = courseDescriptions[title || ''] || courseDescriptions['default']

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

  const handleOpenNotifications = () => console.log('Abrir notificaciones')

  const displayName = user.user_metadata?.full_name || user.email || 'Usuario'
  const userRole = getUserRole(user)

  const handleLearnMore = () => {
    // Navegar al mapa del curso o a otra acción
    navigate('/course-map', {
      state: {
        courseId: courseId
      }
    })
  }

  return (
    <div className="course-pdf-viewer">
      <TopNavigation
        activeKey="progress"
        userDisplayName={displayName}
        userRole={userRole}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        logoutLoading={isLoggingOut}
        notificationCount={42}
        onOpenNotifications={handleOpenNotifications}
      />

      <main className="course-pdf-viewer__main">
        <div className="course-detail-content">
          {/* Sección izquierda - Cuadro de imagen del curso */}
          <div className="course-detail-left">
            <div className="course-detail-image-placeholder">
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="60" cy="40" r="15" fill="#FFFFFF" opacity="0.9" />
                <path
                  d="M30 80 L50 60 L70 60 L90 80 L30 80 Z"
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity="0.9"
                />
              </svg>

              {/* Cohete en la esquina inferior izquierda */}
              <div className="course-detail-rocket">
                <img src={spaceshipImage} alt="Cohete" className="rocket-image" />
              </div>
            </div>
          </div>

          {/* Sección derecha - Contenido de texto */}
          <div className="course-detail-text">
            <h1 className="course-detail-title">{courseTitle}</h1>
            <p className="course-detail-description">
              {courseDescription}
            </p>
            <button className="course-detail-button" onClick={handleLearnMore}>
              Saber más
            </button>
          </div>
        </div>

        {/* Lápiz decorativo */}
        <div className="course-detail-pencil">
          <img src={pencilImage} alt="Lápiz" className="pencil-image" />
        </div>
      </main>
    </div>
  )
}

export default CoursePdfViewerScreen

