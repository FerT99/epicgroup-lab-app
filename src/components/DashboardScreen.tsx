import React, { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'
import { auth } from '../lib/supabase'
import './DashboardScreen.css'
import NavbarProfileControls from './NavbarProfileControls'

interface DashboardScreenProps {
  user: User
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ user }) => {
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

  const displayName = user.user_metadata?.full_name || user.email || 'Usuario'

  return (
    <div className="dashboard-screen">
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
              <button onClick={() => handleNavigation('/my-courses')} className="nav-link">Mis cursos</button>
              <button onClick={() => handleNavigation('/quotes')} className="nav-link">Frases del día</button>
              <button onClick={() => handleNavigation('#')} className="nav-link">Recordatorio</button>
              <button onClick={() => handleNavigation('/progress')} className="nav-link">Progreso</button>
            </nav>
          </div>
          
          <div className="navbar-right">
            <NavbarProfileControls
              userDisplayName={displayName}
              onNavigate={handleNavigation}
              onLogout={handleLogout}
              logoutLoading={loading}
              notificationCount={167}
              onOpenNotifications={() => console.log('Abrir notificaciones')}
            />
          </div>
        </div>
      </div>
      
        <div className="dashboard-content">
          {/* Sección de bienvenida con fondo morado */}
          <div className="welcome-section">
            <div className="welcome-content">
              <div className="welcome-text">
                <h1 className="welcome-title">¡Bienvenid@!</h1>
                <h2 className="user-name">{user.user_metadata?.full_name || user.email}</h2>
                <div className="progress-info">
                  <span className="medal-icon">🏅 3.5 →</span>
                  <p className="progress-text" color="white">Haz click para descubrir tu progreso! sigue avanzando y llega a la meta.</p>
                </div>
                <button className="level-up-btn">¡Sube de nivel!</button>
              </div>
            </div>
            
            {/* Elementos espaciales */}
            <div className="space-composition">
              <img src="/src/assets/image10.png" alt="Astronauta" className="astronaut-image_fl" />
              <img src="/src/assets/image11.png" alt="Elemento decorativo" className="space-image_Element_E" />
              <img src="/src/assets/image_9.png" alt="Elemento decorativo" className="space-image_green" />
            </div>
          </div>

        </div>

    </div>
  )
}

export default DashboardScreen
