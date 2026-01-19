import React from 'react'
import { useNavigate } from 'react-router-dom'
import { User } from '@supabase/supabase-js'
import Sidebar from './Sidebar'
import './CoursesScreen.css'


interface CoursesScreenProps {
  user: User
}

const CoursesScreen: React.FC<CoursesScreenProps> = ({ user }) => {
  const navigate = useNavigate()

  return (
    <div className="courses-screen">
      <Sidebar isCollapsed={false} />

      <div className="main-content">
        <div className="content-header">
          <div className="user-menu">
            <div className="user-avatar">
              <span className="avatar-text">
                {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </span>
            </div>
            <span className="user-email">{user.email}</span>
            <button className="logout-btn" onClick={() => navigate('/login')}>
              Cerrar Sesión
            </button>
          </div>
        </div>

        <div className="courses-content">
          <div className="welcome-section">
            <h2 className="welcome-title">¡Hola! {user.user_metadata?.full_name || 'Usuario'}</h2>
            <p className="welcome-subtitle">Explora tus cursos disponibles</p>
          </div>

          <div className="search-section">
            <div className="search-bar">
              <div className="search-icon">🔍</div>
              <input type="text" placeholder="Buscar cursos..." className="search-input" />
              <div className="filter-icon">⚙️</div>
            </div>
          </div>

          <div className="tabs-section">
            <div className="tab active">Inicio</div>
            <div className="tab">Frases del día</div>
            <div className="tab">Recordatorios</div>
          </div>


          <div className="courses-grid">
            {/* TODO: Fetch courses from backend and map them here */}
            <div className="empty-state">
              <p>No hay cursos disponibles</p>
              <p className="empty-state-subtitle">Los cursos aparecerán aquí cuando se carguen desde el backend</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoursesScreen
