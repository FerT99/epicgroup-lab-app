import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../lib/supabase'
import { User } from '@supabase/supabase-js'
import Sidebar from './Sidebar'
import './ProgressScreen.css'

interface ProgressScreenProps {
  user: User
}

const ProgressScreen: React.FC<ProgressScreenProps> = ({ user }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await auth.signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <div className="progress-screen">
      <Sidebar isCollapsed={sidebarCollapsed} />
      
      <div className="main-content">
        <div className="content-header">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            ☰
          </button>
          <h1 className="page-title">Progreso</h1>
          <div className="user-menu">
            <span className="user-email">{user.email}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        </div>
        
        <div className="progress-content">
          {/* Título de la sección */}
          <div className="section-header">
            <h2 className="section-title">Progreso de Cursos</h2>
            <p className="section-subtitle">¡Un paso más a la meta!</p>
          </div>
          
          {/* Cards de progreso de cursos */}
          <div className="course-progress-cards">
            {/* Card NEW STARTECH */}
            <div className="course-progress-card">
              <div className="card-header">
                <div className="course-icon">🚀</div>
                <div className="course-title">NEW STARTECH</div>
              </div>
              <div className="progress-steps">
                <div className="step-line"></div>
                <div className="step-circles">
                  <div className="step-circle completed">01</div>
                  <div className="step-circle completed">02</div>
                  <div className="step-circle pending">03</div>
                  <div className="step-circle pending">04</div>
                  <div className="step-circle pending">05</div>
                  <div className="step-circle pending">06</div>
                  <div className="step-circle pending">07</div>
                </div>
              </div>
              <div className="course-completion">
                <span className="completion-text">Curso completo</span>
                <span className="completion-arrow">▶</span>
              </div>
            </div>

            {/* Card INGLÉS */}
            <div className="course-progress-card">
              <div className="card-header">
                <div className="course-icon">📚</div>
                <div className="course-title">INGLÉS</div>
              </div>
              <div className="progress-steps">
                <div className="step-line"></div>
                <div className="step-circles">
                  <div className="step-circle completed">01</div>
                  <div className="step-circle completed">02</div>
                  <div className="step-circle pending">03</div>
                  <div className="step-circle pending">04</div>
                  <div className="step-circle pending">05</div>
                  <div className="step-circle pending">06</div>
                  <div className="step-circle pending">07</div>
                </div>
              </div>
              <div className="course-completion">
                <span className="completion-text">Curso completo</span>
                <span className="completion-arrow">▶</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProgressScreen
