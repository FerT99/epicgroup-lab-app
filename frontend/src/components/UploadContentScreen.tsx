import React from 'react'
import { User } from '@supabase/supabase-js'
import TopNavigation from './TopNavigation'
import { useNavigate } from 'react-router-dom'
import { auth } from '../lib/supabase'
import { getUserRole } from '../utils/getUserRole'
import './UploadContentScreen.css'
import manoverde from '../assets/manoverde.png'
import element from '../assets/element.png'
import orange from '../assets/orange.png'
import manoamarilla from '../assets/manoamarilla.png'
import newstartech from '../assets/newstartech.png'
import todayswork from '../assets/todayswork.png'
import card from '../assets/card.png'

interface UploadContentScreenProps {
  user: User
}

const UploadContentScreen: React.FC<UploadContentScreenProps> = ({ user }) => {
  const navigate = useNavigate()

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  const handleLogout = async () => {
    try {
      await auth.signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const displayName = user.user_metadata?.full_name || user.email || 'Usuario'
  const userRole = getUserRole(user)
  const handleOpenNotifications = () => console.log('Abrir notificaciones')

  return (
    <div className="upload-content-screen">
      <TopNavigation
        activeKey="dashboard"
        userDisplayName={displayName}
        userRole={userRole}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        logoutLoading={false}
        notificationCount={42}
        onOpenNotifications={handleOpenNotifications}
      />

      <div className="upload-content-container">
        {/* Lado izquierdo - Sección decorativa */}
        <div className="upload-left-section">
          {/* Logo EPICGROUP LAB en la parte superior izquierda */}

          {/* Elemento decorativo verde (mano) arriba */}
          <img
            src={manoverde}
            alt="Mano verde decorativa"
            className="decorative-element mano-verde"
          />

          {/* Logo New Startech */}
          <img
            src={newstartech}
            alt="New Startech"
            className="decorative-element newstartech"
          />

          {/* Today's Work circle */}
          <div className="circle-element circle-todayswork">
            <img
              src={todayswork}
              alt="Today's Work"
              className="circle-image"
            />
          </div>

          {/* Card circle */}
          <div className="circle-element circle-card">
            <img
              src={card}
              alt="Design Card"
              className="circle-image"
            />
          </div>

          {/* Orange element */}
          <img
            src={orange}
            alt="Orange decorativo"
            className="decorative-element orange"
          />

          {/* Mano amarilla en la parte inferior derecha */}
          <img
            src={manoamarilla}
            alt="Mano amarilla decorativa"
            className="decorative-element mano-amarilla"
          />

          {/* Elemento decorativo adicional */}
          <img
            src={element}
            alt="Elemento decorativo"
            className="decorative-element element-extra"
          />
        </div>

        {/* Lado derecho - Sección funcional */}
        <div className="upload-right-section">
          <h1 className="upload-title">Mis cursos</h1>

          {/* Grid de cursos/contenido */}
          <div className="courses-grid">
            <div className="course-item">
              <h3 className="course-item-title">LOREM IPSUM</h3>
              <p className="course-item-description">
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod
              </p>
              <div className="course-item-image">
                <div className="image-placeholder">
                  <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="course-item">
              <h3 className="course-item-title">LOREM IPSUM</h3>
              <p className="course-item-description">
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod
              </p>
              <div className="course-item-image">
                <div className="image-placeholder">
                  <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="course-item">
              <h3 className="course-item-title">LOREM IPSUM</h3>
              <p className="course-item-description">
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod
              </p>
              <div className="course-item-image">
                <div className="image-placeholder">
                  <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de subir contenido */}
          <div className="upload-section">
            <label className="upload-label">Subir contenido</label>
            <div className="upload-input-container">
              <input
                type="text"
                className="upload-input"
                placeholder="Ingresa el contenido aquí..."
              />
              <button className="upload-button">Get started</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadContentScreen
