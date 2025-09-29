import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './Sidebar.css'
import astronautaImage from '../assets/astronauta.png'

interface SidebarProps {
  isCollapsed?: boolean
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  const isActive = (path: string) => {
    return location.pathname === path
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
            className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => handleNavigation('/dashboard')}
          >
            <div className="nav-icon">📚</div>
            {!isCollapsed && <span className="nav-text">Mis Cursos</span>}
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
            {!isCollapsed && <span className="nav-text">Frases del Día</span>}
          </li>
          <li className="nav-item">
            <div className="nav-icon">🔔</div>
            {!isCollapsed && <span className="nav-text">Recordatorios</span>}
          </li>
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">👤</div>
          {!isCollapsed && <span className="user-name">Usuario</span>}
        </div>
      </div>
    </div>
  )
}

export default Sidebar
