import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { auth } from '../lib/supabase'
import { User } from '@supabase/supabase-js'
import Sidebar from './Sidebar'
import './CourseDetailScreen.css'
import appmobile02 from '../assets/APPMOBILE-02.png'
import appmobile03 from '../assets/APPMOBILE-03.png'
import appmobile04 from '../assets/APPMOBILE-04.png'

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

  // Datos de ejemplo de los cursos
  const coursesData = {
    'desarrollo-web': {
      name: 'Desarrollo Web',
      icon: '🚀',
      image: appmobile02,
      students: 78,
      rating: 4.2,
      completedTasks: 6,
      totalTasks: 8,
      progress: (6 / 8) * 100,
      scheduleItems: [
        { title: 'Introducción a HTML', duration: '15:00 min', completed: true, progress: 100 },
        { title: 'CSS Básico', duration: '20:00 min', completed: true, progress: 100 },
        { title: 'JavaScript Fundamentos', duration: '25:00 min', completed: true, progress: 100 },
        { title: 'React Básico', duration: '30:00 min', completed: true, progress: 100 },
        { title: 'Proyecto Final', duration: '45:00 min', completed: false, progress: 0 }
      ]
    },
    'ingles': {
      name: 'Inglés',
      icon: '📚',
      image: appmobile03,
      students: 45,
      rating: 3.5,
      completedTasks: 3,
      totalTasks: 7,
      progress: (3 / 7) * 100,
      scheduleItems: [
        { title: 'Bienvenida', duration: '10:00 min', completed: true, progress: 100 },
        { title: 'Saludos y Presentaciones', duration: '15:00 min', completed: true, progress: 100 },
        { title: 'Vocabulario Básico', duration: '20:00 min', completed: true, progress: 100 },
        { title: 'Gramática Simple', duration: '25:00 min', completed: false, progress: 0 },
        { title: 'Conversación Básica', duration: '30:00 min', completed: false, progress: 0 }
      ]
    },
    'react-native': {
      name: 'React Native',
      icon: '📱',
      image: appmobile04,
      students: 32,
      rating: 4.8,
      completedTasks: 8,
      totalTasks: 10,
      progress: (8 / 10) * 100,
      scheduleItems: [
        { title: 'Configuración del Entorno', duration: '20:00 min', completed: true, progress: 100 },
        { title: 'Componentes Básicos', duration: '25:00 min', completed: true, progress: 100 },
        { title: 'Navegación', duration: '30:00 min', completed: true, progress: 100 },
        { title: 'Estado y Props', duration: '35:00 min', completed: true, progress: 100 },
        { title: 'APIs y Networking', duration: '40:00 min', completed: false, progress: 0 }
      ]
    }
  }

  const courseData = coursesData[courseId as keyof typeof coursesData] || coursesData['ingles']

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
              {courseData.scheduleItems.map((item, index) => (
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
              ))}
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
                    style={{width: `${courseData.progress}%`}}
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
