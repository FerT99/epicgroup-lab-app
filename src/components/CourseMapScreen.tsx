import React, { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useLocation, useNavigate } from 'react-router-dom'
import './CourseMapScreen.css'
import { auth } from '../lib/supabase'
import TopNavigation from './TopNavigation'

interface CourseMapScreenProps {
  user: User
}

interface CourseMapLocationState {
  courseId?: number | string
  courseTitle?: string
  planetResources?: Record<number, string>
}

const FALLBACK_PDF =
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'

const CourseMapScreen: React.FC<CourseMapScreenProps> = ({ user }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = (location.state as CourseMapLocationState) || {}
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

  const handleOpenNotifications = () => console.log('Abrir notificaciones')

  const displayName = user.user_metadata?.full_name || user.email || 'Usuario'
  const activeCourseId = locationState.courseId ?? 'general'
  const activeCourseTitle = locationState.courseTitle ?? 'Mapa del curso'
  const planetResources = locationState.planetResources ?? {}

  // Datos de los planetas/cursos con las imágenes reales
  const basePlanets = [
    {
      id: 1,
      number: 1,
      stars: 3,
      completed: true,
      image: '/src/assets/image30.png', // Planeta verde con puntos amarillos
      position: { top: '75%', left: '82%' },
      title: 'Módulo 1 · Introducción',
      defaultPdfUrl: FALLBACK_PDF
    },
    {
      id: 2,
      number: 2,
      stars: 1,
      completed: false,
      image: '/src/assets/image36.png', // Planeta azul con textura
      position: { top: '50%', left: '68%' },
      title: 'Módulo 2 · Conceptos clave',
      defaultPdfUrl: 'https://www.africau.edu/images/default/sample.pdf'
    },
    {
      id: 3,
      number: 3,
      stars: 2,
      completed: false,
      image: '/src/assets/image37.png', // Planeta fuego/naranja
      position: { top: '65%', left: '48%' },
      title: 'Módulo 3 · Práctica guiada',
      defaultPdfUrl: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf'
    },
    {
      id: 4,
      number: 4,
      stars: 1,
      completed: false,
      image: '/src/assets/image38.png', // Planeta volcánico/rojo
      position: { top: '40%', left: '42%' },
      title: 'Módulo 4 · Evaluación',
      defaultPdfUrl: 'https://file-examples.com/storage/fe630daaa009f173c5140d0/2017/10/file-sample_150kB.pdf'
    },
    {
      id: 5,
      number: 5,
      stars: 0,
      completed: false,
      image: '/src/assets/image39.png', // Planeta morado con espiral
      position: { top: '55%', left: '22%' },
      title: 'Módulo 5 · Caso de estudio',
      defaultPdfUrl: FALLBACK_PDF
    },
    {
      id: 6,
      number: 6,
      stars: 0,
      completed: false,
      image: '/src/assets/image40.png', // Planeta oscuro/morado
      position: { top: '35%', left: '12%' },
      title: 'Módulo 6 · Proyecto final',
      defaultPdfUrl: FALLBACK_PDF
    },
    {
      id: 7,
      number: 7,
      stars: 0,
      completed: false,
      image: '/src/assets/image41.png', // Planeta concha/gris
      position: { top: '20%', left: '32%' },
      title: 'Módulo 7 · Recursos adicionales',
      defaultPdfUrl: FALLBACK_PDF
    },
    {
      id: 8,
      number: 8,
      stars: 0,
      completed: false,
      image: '/src/assets/image42.png', // Planeta roca/púrpura
      position: { top: '15%', left: '12%' },
      title: 'Módulo 8 · Créditos',
      defaultPdfUrl: FALLBACK_PDF
    }
  ]

  const coursePlanets = basePlanets.map((planet) => ({
    ...planet,
    pdfUrl: planetResources[planet.id] ?? planet.defaultPdfUrl
  }))

  const handlePlanetClick = (planetId: number) => {
    const planet = coursePlanets.find((item) => item.id === planetId)
    if (!planet) return

    navigate(`/course/${activeCourseId}/content/${planetId}`, {
      state: {
        pdfUrl: planet.pdfUrl,
        title: planet.title
      }
    })
  }

  const handleStartCourse = () => {
    handlePlanetClick(coursePlanets[0]?.id ?? 1)
  }

  return (
    <div className="course-map-screen">
      <TopNavigation
        activeKey="progress"
        userDisplayName={displayName}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        logoutLoading={isLoggingOut}
        notificationCount={42}
        onOpenNotifications={handleOpenNotifications}
      />

      {/* Contenido del mapa */}
      <div className="map-container">
        <div className="course-map-header">
          <h1>{activeCourseTitle}</h1>
          <p>Selecciona un planeta para abrir el material del módulo.</p>
        </div>
        {/* Fondo espacial con estrellas */}
        <div className="space-background">
          <div className="stars"></div>
          <div className="nebula"></div>
        </div>

        {/* Terreno alienígena */}
        <div className="alien-terrain"></div>

        {/* Líneas de conexión entre planetas */}
        <svg className="connection-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Línea principal que conecta todos los planetas */}
          <path 
            d="M82,75 Q68,65 68,50 Q48,45 48,65 Q22,55 12,55 Q12,35 12,35 Q32,25 32,20 Q12,15 12,15" 
            stroke="#FFC000" 
            strokeWidth="0.5" 
            fill="none" 
            strokeDasharray="2,2"
            className="main-path"
          />
          {/* Línea secundaria */}
          <path 
            d="M82,75 Q55,70 48,65 Q35,60 22,55" 
            stroke="#00BFFF" 
            strokeWidth="0.3" 
            fill="none" 
            strokeDasharray="1,1"
            className="secondary-path"
          />
        </svg>

        {/* Planetas */}
        {coursePlanets.map((planet) => (
          <div 
            key={planet.id} 
            className={`planet-container ${planet.completed ? 'completed' : 'locked'}`}
            style={planet.position}
            onClick={() => handlePlanetClick(planet.id)}
          >
            <div className="planet-frame">
              {/* Imagen del planeta */}
              <img 
                src={planet.image} 
                alt={`Planeta ${planet.number}`}
                className="planet-image"
              />
              
              {/* Número del planeta */}
              <div className="planet-number">
                {planet.number}
              </div>
              
              {/* Estrellas */}
              <div className="planet-stars">
                {Array.from({ length: 3 }, (_, index) => (
                  <div 
                    key={index} 
                    className={`star ${index < planet.stars ? 'filled' : 'empty'}`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Cohete */}
        <div className="rocket-container">
          <div className="rocket">
            <div className="rocket-nose"></div>
            <div className="rocket-body">
              <div className="rocket-window"></div>
              <div className="rocket-bands"></div>
            </div>
            <div className="rocket-fins"></div>
            <div className="rocket-engine">
              <div className="engine-glow"></div>
            </div>
          </div>
        </div>

        {/* Botón START */}
        <div className="start-button-container">
          <button className="start-button" onClick={handleStartCourse}>
            START
          </button>
        </div>
      </div>
    </div>
  )
}

export default CourseMapScreen
