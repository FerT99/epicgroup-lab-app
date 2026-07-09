import React, { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'
import './AssignmentsScreen.css'
import { getUserRole } from '../utils/getUserRole'

import image30 from '../assets/image30.png'
import image36 from '../assets/image36.png'
import image37 from '../assets/image37.png'
import image38 from '../assets/image38.png'
import image39 from '../assets/image39.png'

interface AssignmentsScreenProps {
  user: User
}

const AssignmentsScreen: React.FC<AssignmentsScreenProps> = ({ user }) => {
  const navigate = useNavigate()
  const userRole = getUserRole(user)

  const [coursePlanets, setCoursePlanets] = useState<any[]>([])

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const endpoint = userRole === 'student' 
          ? `http://localhost:3001/api/students/${user.id}/courses`
          : `http://localhost:3001/api/professors/${user.id}/courses`;
          
        const res = await fetch(endpoint)
        if (!res.ok) throw new Error('Error fetching courses')
        const data = await res.json()
        
        // Define some planet images and positions
        const images = [image30, image36, image37, image38, image39]
        const positions = [
          { top: '80%', left: '20%' },
          { top: '60%', left: '50%' },
          { top: '35%', left: '30%' },
          { top: '20%', left: '70%' },
          { top: '10%', left: '40%' }
        ]

        const planets = data.map((course: any, index: number) => ({
          id: course.id,
          number: index + 1,
          stars: 0,
          completed: false,
          image: images[index % images.length],
          position: positions[index % positions.length],
          title: course.title || course.name,
          courseData: course
        }))

        setCoursePlanets(planets)
      } catch (err) {
        console.error("Error fetching courses:", err)
      }
    }
    fetchCourses()
  }, [user.id, userRole])

  const handlePlanetClick = (course: any) => {
    const courseTitle = course.title || course.name;
    navigate(`/course/${course.id}/planet/1`, { state: { title: courseTitle, courseTitle: courseTitle } })
  }

  const handleStartCourse = () => {
    if (coursePlanets.length > 0) {
      handlePlanetClick(coursePlanets[0].courseData)
    }
  }

  return (
    <div className="assignments-screen">
      <div className="map-container">
        <button 
          onClick={() => navigate('/dashboard')} 
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 100,
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            backdropFilter: 'blur(5px)',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          ← Volver
        </button>

        <div className="course-map-header">
          <h1>Tus Cursos Asignados</h1>
          <p>Selecciona un planeta para ver los módulos del curso.</p>
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
          <path
            d="M82,75 Q68,65 68,50 Q48,45 48,65 Q22,55 12,55 Q12,35 12,35 Q32,25 32,20 Q12,15 12,15"
            stroke="#FFC000"
            strokeWidth="0.5"
            fill="none"
            strokeDasharray="2,2"
            className="main-path"
          />
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
            onClick={() => handlePlanetClick(planet.courseData)}
          >
            <div className="planet-frame">
              {/* Imagen del planeta */}
              <img
                src={planet.image}
                alt={`Planeta ${planet.number}`}
                className="planet-image"
              />

              {/* Título debajo del planeta */}
              <div className="course-planet-title">
                {planet.title}
              </div>

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

export default AssignmentsScreen
