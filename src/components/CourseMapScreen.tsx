import React from 'react'
import { User } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'
import './CourseMapScreen.css'

interface CourseMapScreenProps {
  user: User
}

const CourseMapScreen: React.FC<CourseMapScreenProps> = ({ user: _user }) => {
  const navigate = useNavigate()

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  // Datos de los planetas/cursos con las imágenes reales
  const coursePlanets = [
    {
      id: 1,
      number: 1,
      stars: 3,
      completed: true,
      image: '/src/assets/image30.png', // Planeta verde con puntos amarillos
      position: { top: '75%', left: '82%' }
    },
    {
      id: 2,
      number: 2,
      stars: 1,
      completed: false,
      image: '/src/assets/image36.png', // Planeta azul con textura
      position: { top: '50%', left: '68%' }
    },
    {
      id: 3,
      number: 3,
      stars: 2,
      completed: false,
      image: '/src/assets/image37.png', // Planeta fuego/naranja
      position: { top: '65%', left: '48%' }
    },
    {
      id: 4,
      number: 4,
      stars: 1,
      completed: false,
      image: '/src/assets/image38.png', // Planeta volcánico/rojo
      position: { top: '40%', left: '42%' }
    },
    {
      id: 5,
      number: 5,
      stars: 0,
      completed: false,
      image: '/src/assets/image39.png', // Planeta morado con espiral
      position: { top: '55%', left: '22%' }
    },
    {
      id: 6,
      number: 6,
      stars: 0,
      completed: false,
      image: '/src/assets/image40.png', // Planeta oscuro/morado
      position: { top: '35%', left: '12%' }
    },
    {
      id: 7,
      number: 7,
      stars: 0,
      completed: false,
      image: '/src/assets/image41.png', // Planeta concha/gris
      position: { top: '20%', left: '32%' }
    },
    {
      id: 8,
      number: 8,
      stars: 0,
      completed: false,
      image: '/src/assets/image42.png', // Planeta roca/púrpura
      position: { top: '15%', left: '12%' }
    }
  ]

  const handlePlanetClick = (planetId: number) => {
    console.log(`Planeta ${planetId} clickeado`)
    // Aquí puedes agregar la lógica para ir al curso específico
  }

  const handleStartCourse = () => {
    console.log('Iniciando curso')
    // Aquí puedes agregar la lógica para iniciar el curso
  }

  return (
    <div className="course-map-screen">
      {/* Logo EPICGROUP LAB en esquina superior izquierda */}
      <div className="logo-container-top" onClick={() => handleNavigation('/dashboard')}>
        <img src="/src/assets/epic2.png" alt="EPICGROUP LAB" className="main-logo" />
      </div>

      {/* Barra de navegación superior */}
      <div className="top-navbar">
        <div className="navbar-content">
          <div className="navbar-left">
          </div>
          
          <div className="navbar-center">
            <nav className="nav-links">
              <button onClick={() => handleNavigation('/progress')} className="nav-link">Mis cursos</button>
              <button onClick={() => handleNavigation('/quotes')} className="nav-link">Frases del día</button>
              <button onClick={() => handleNavigation('#')} className="nav-link">Recordatorio</button>
              <button onClick={() => handleNavigation('/progress')} className="nav-link">Progreso</button>
            </nav>
          </div>
          
          <div className="navbar-right">
            <button className="menu-toggle">☰</button>
          </div>
        </div>
      </div>

      {/* Contenido del mapa */}
      <div className="map-container">
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
