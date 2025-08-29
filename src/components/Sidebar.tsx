import React from 'react'
import './Sidebar.css'

interface SidebarProps {
  isCollapsed?: boolean
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false }) => {
  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">E</div>
          {!isCollapsed && (
            <div className="logo-text">
              <div className="logo-title">EPICGROUP LAB</div>
              <div className="logo-subtitle">innovación educativa</div>
            </div>
          )}
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="nav-list">
          <li className="nav-item active">
            <div className="nav-icon">🏠</div>
            {!isCollapsed && <span className="nav-text">Inicio</span>}
          </li>
          <li className="nav-item">
            <div className="nav-icon">📚</div>
            {!isCollapsed && <span className="nav-text">Mis Cursos</span>}
          </li>
          <li className="nav-item">
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
