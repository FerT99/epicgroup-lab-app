import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { auth } from '../lib/supabase'
import { User } from '@supabase/supabase-js'
import Sidebar from './Sidebar'
import './CourseDetailScreen.css'
import appmobile02 from '../assets/APPMOBILE-02.png'

interface CourseDetailScreenProps {
  user: User
}

const CourseDetailScreen: React.FC<CourseDetailScreenProps> = ({ user }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState<'tasks' | 'grades'>('tasks')
  const navigate = useNavigate()
  const { courseId } = useParams()

  const handleLogout = async () => {
    try {
      await auth.signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const handleBackToDashboard = () => {
    navigate('/dashboard')
  }

  // TODO: Fetch course data from backend based on courseId
  const courseData = {
    name: 'Curso',
    icon: '📚',
    image: appmobile02,
    students: 0,
    rating: 0,
    completedTasks: 0,
    totalTasks: 0,
    progress: 0,
    scheduleItems: [] as Array<{ title: string; duration: string; completed: boolean; progress: number }>
  }

  return (
    <div className="course-detail-screen">
      <Sidebar isCollapsed={sidebarCollapsed} />

      <div className="main-content">
        <div className="content-header">
          <div className="header-left">
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              ☰
            </button>
            <button className="back-button" onClick={handleBackToDashboard}>
              ← Volver
            </button>
          </div>
          <h1 className="page-title">Detalles del Curso</h1>
          <div className="user-menu">
            <span className="user-email">{user.email}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        </div>

        <div className="course-detail-content">
          {/* Header del curso */}
          <div className="course-header">
            <div className={`course-header-background ${courseId}`}>
              {/* Imagen de fondo */}
              <img
                src={courseData.image}
                alt={`Fondo del curso ${courseData.name}`}
                className="course-background-image"
              />

              {/* Elementos decorativos */}
              <div className="decorative-elements">
                <div className="decorative-circle circle-1"></div>
                <div className="decorative-circle circle-2"></div>
                <div className="decorative-shape shape-1"></div>
                <div className="decorative-shape shape-2"></div>
              </div>

              {/* Menú hamburguesa */}
              <div className="course-menu">
                <button className="menu-button">☰</button>
              </div>

              {/* Contenido principal */}
              <div className="course-header-content">
                <div className="course-title-section">
                  <div className="course-title-container">
                    <div className="course-title-circle">
                      <h1 className="course-title">{courseData.name}</h1>
                    </div>
                  </div>
                  <div className="course-stats">
                    <div className="stat-badge">
                      <span className="stat-icon">👥</span>
                      <span className="stat-value">{courseData.students}</span>
                    </div>
                    <div className="stat-badge">
                      <span className="stat-icon">⭐</span>
                      <span className="stat-value">{courseData.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Elementos decorativos del lado derecho */}
                <div className="right-decorations">
                  <div className="person-icon">👤</div>
                  <div className="lightbulb-icon">💡</div>
                  <div className="gear-icon">⚙️</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de Cronograma */}
          <div className="schedule-section">
            <div className="schedule-header">
              <h2 className="schedule-title">Cronograma</h2>
              <button className="download-btn">
                <span className="download-icon">⬇️</span>
              </button>
            </div>

            <div className="schedule-list">
              {courseData.scheduleItems.length === 0 ? (
                <div className="empty-state">
                  <p>No hay elementos en el cronograma</p>
                </div>
              ) : (
                courseData.scheduleItems.map((item, index) => (
                  <div key={index} className="schedule-item">
                    <div className="schedule-item-left">
                      <div className={`completion-circle ${item.completed ? 'completed' : ''}`}>
                        {item.completed && <span className="checkmark">✓</span>}
                      </div>
                      <div className="schedule-item-info">
                        <span className="schedule-item-title">{item.title}</span>
                        <span className="schedule-item-duration">{item.duration}</span>
                      </div>
                    </div>
                    <div className="schedule-item-progress">
                      <span className="progress-percentage">{item.progress}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tabs de navegación */}
          <div className="tabs-section">
            <div className="tabs-container">
              <button
                className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`}
                onClick={() => setActiveTab('tasks')}
              >
                Mis tareas
                {activeTab === 'tasks' && <div className="tab-indicator"></div>}
              </button>
              <button
                className={`tab-button ${activeTab === 'grades' ? 'active' : ''}`}
                onClick={() => setActiveTab('grades')}
              >
                Mis calificaciones
                {activeTab === 'grades' && <div className="tab-indicator"></div>}
              </button>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="progress-section">
            <div className="progress-container">
              <div className="progress-icon-left">🏅</div>
              <div className="progress-bar-container">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${courseData.progress}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  Tareas completadas {courseData.completedTasks}/{courseData.totalTasks}
                </div>
              </div>
              <div className="progress-icon-right">🏅</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseDetailScreen
