import React, { useMemo, useRef, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'
import './MyCoursesScreen.css'
import { auth } from '../lib/supabase'
import coursePlaceholder from '../assets/image26.png'
import TopNavigation from './TopNavigation'

interface MyCoursesScreenProps {
  user: User
}

const CARD_WIDTH = 240
const CARD_GAP = 32

const MyCoursesScreen: React.FC<MyCoursesScreenProps> = ({ user }) => {
  const navigate = useNavigate()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const handleOpenNotifications = () => console.log('Abrir notificaciones')

  const courses = useMemo(() => {
    return Array.from({ length: 8 }, (_, index) => ({
      id: index + 1,
      title: `Curso ${index + 1}`,
      cover: coursePlaceholder
    }))
  }, [])

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  const handleLogout = async () => {
    setLogoutLoading(true)
    try {
      await auth.signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    } finally {
      setLogoutLoading(false)
    }
  }

  const scrollCarousel = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (!container) return

    const offset = CARD_WIDTH + CARD_GAP
    const newScrollLeft = direction === 'left'
      ? container.scrollLeft - offset
      : container.scrollLeft + offset

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    })
  }

  return (
    <div className="my-courses-screen">
      <TopNavigation
        activeKey="my-courses"
        userDisplayName={user.user_metadata?.full_name || user.email || 'Usuario'}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        logoutLoading={logoutLoading}
        notificationCount={42}
        onOpenNotifications={handleOpenNotifications}
      />

      <main className="courses-main" color="white">
        <header className="courses-header" color="white">
          <h1 className="courses-title">Mis cursos</h1>
          <p className="courses-description" color="white">
            Explora los cursos disponibles para continuar tu progreso.
          </p>
        </header>

        <section className="courses-carousel-wrapper">
          <button
            className="carousel-control left"
            type="button"
            aria-label="Cursos anteriores"
            onClick={() => scrollCarousel('left')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <div className="courses-carousel" ref={scrollContainerRef}>
            {courses.map((course) => (
              <article key={course.id} className="course-card">
                <img src={course.cover} alt={`Portada curso ${course.title}`} />
                <div className="course-card-overlay">
                  <h2>{course.title}</h2>
                  <button
                    type="button"
                    className="course-card-cta"
                    onClick={() => console.log(`Ver curso ${course.id}`)}
                  >
                    Ver detalles
                  </button>
                </div>
              </article>
            ))}
          </div>

          <button
            className="carousel-control right"
            type="button"
            aria-label="Cursos siguientes"
            onClick={() => scrollCarousel('right')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>
        </section>
      </main>
    </div>
  )
}

export default MyCoursesScreen

