import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './Sidebar.css'
import astronautaImage from '../assets/astronauta.png'
import NavbarProfileControls from './NavbarProfileControls'
import { auth } from '../lib/supabase'

interface SidebarProps {
  isCollapsed?: boolean
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const displayName = 'Raquel López'

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await auth.signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error al cerrar sesión desde la barra lateral:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {!isCollapsed && (
        <div className="welcome-section">
          <div className="welcome-card">
            <div className="welcome-avatar">
              <img src={astronautaImage} alt="Astronauta" className="astronaut-image" />
            </div>
            <div className="welcome-content">
              <h3 className="welcome-greeting">¡Hola!</h3>
              <p className="welcome-name">Raquel López</p>
              <div className="achievement-badge">
                <span className="badge-number">1</span>
                <span className="medal-icon">🥇</span>
                <span className="achievement-score">3.5</span>
                <span className="arrow-icon">→</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="sidebar-nav">
        <ul className="nav-list">
          <li
            className={`nav-item ${isActive('/my-courses') ? 'active' : ''}`}
            onClick={() => handleNavigation('/my-courses')}
          >
            <div className="nav-icon">📚</div>
            {!isCollapsed && <span className="nav-text">Inicio</span>}
          </li>
          <li
            className={`nav-item ${isActive('/progress') ? 'active' : ''}`}
            onClick={() => handleNavigation('/progress')}
          >
            <div className="nav-icon">📊</div>
            {!isCollapsed && <span className="nav-text">Progreso</span>}
          </li>
          <li
            className={`nav-item ${isActive('/quotes') ? 'active' : ''}`}
            onClick={() => handleNavigation('/quotes')}
          >
            <div className="nav-icon">💬</div>
            {!isCollapsed && <span className="nav-text">Agenda</span>}
          </li>
          <li
            className={`nav-item ${isActive('/assignments') ? 'active' : ''}`}
            onClick={() => handleNavigation('/assignments')}
          >
            <div className="nav-icon">📝</div>
            {!isCollapsed && <span className="nav-text">Tareas</span>}
          </li>
          <li className="nav-item">
            <div className="nav-icon">🔔</div>
            {!isCollapsed && <span className="nav-text">Recordatorios</span>}
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        {!isCollapsed ? (
          <NavbarProfileControls
            userDisplayName={displayName}
            onNavigate={handleNavigation}
            onLogout={handleLogout}
            logoutLoading={isLoggingOut}
            notificationCount={12}
            onOpenNotifications={() => console.log('Abrir notificaciones')}
            settingsPath=""
          />
        ) : (
          <button
            className="sidebar-collapsed-user"
            type="button"
            onClick={() => handleNavigation('/profile')}
            title="Ver perfil"
          >
            RL
          </button>
        )}
      </div>
    </div>
  )
}

export default Sidebar
