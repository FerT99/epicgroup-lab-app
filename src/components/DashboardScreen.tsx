import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../lib/supabase'
import { User } from '@supabase/supabase-js'
import Sidebar from './Sidebar'
import './DashboardScreen.css'

interface DashboardScreenProps {
  user: User
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ user }) => {
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
    <div className="dashboard-screen">
      <Sidebar isCollapsed={sidebarCollapsed} />
      
      <div className="main-content">
        <div className="content-header">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            ☰
          </button>
          <h1 className="page-title">Dashboard</h1>
          <div className="user-menu">
            <span className="user-email">{user.email}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        </div>
        
        <div className="dashboard-content">
          <div className="welcome-section">
            <h2 className="welcome-title">¡Bienvenido, {user.user_metadata?.full_name || 'Usuario'}!</h2>
            <p className="welcome-subtitle">Aquí tienes un resumen de tu progreso educativo</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-info">
                <h3 className="stat-number">3</h3>
                <p className="stat-label">Cursos Activos</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-info">
                <h3 className="stat-number">75%</h3>
                <p className="stat-label">Progreso Promedio</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-info">
                <h3 className="stat-number">12</h3>
                <p className="stat-label">Logros Desbloqueados</p>
              </div>
            </div>
          </div>

          <div className="courses-section">
            <h3 className="section-title">Mis Cursos</h3>
            <div className="courses-grid">
              <div className="course-card">
                <div className="course-image">
                  <div className="course-icon">🚀</div>
                </div>
                <div className="course-info">
                  <h4 className="course-name">Desarrollo Web</h4>
                  <p className="course-description">HTML, CSS y JavaScript</p>
                  <div className="course-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: '75%'}}></div>
                    </div>
                    <span className="progress-text">75%</span>
                  </div>
                </div>
              </div>

              <div className="course-card">
                <div className="course-image">
                  <div className="course-icon">🎨</div>
                </div>
                <div className="course-info">
                  <h4 className="course-name">Diseño UX/UI</h4>
                  <p className="course-description">Principios de diseño</p>
                  <div className="course-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: '45%'}}></div>
                    </div>
                    <span className="progress-text">45%</span>
                  </div>
                </div>
              </div>

              <div className="course-card">
                <div className="course-image">
                  <div className="course-icon">📱</div>
                </div>
                <div className="course-info">
                  <h4 className="course-name">React Native</h4>
                  <p className="course-description">Apps móviles</p>
                  <div className="course-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: '90%'}}></div>
                    </div>
                    <span className="progress-text">90%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardScreen
