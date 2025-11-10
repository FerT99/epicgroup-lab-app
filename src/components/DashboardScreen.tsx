import React, { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'
import { auth } from '../lib/supabase'
import './DashboardScreen.css'
import TopNavigation from './TopNavigation'

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
  const handleOpenNotifications = () => console.log('Abrir notificaciones')

  return (
    <div className="dashboard-screen">
      <TopNavigation
        activeKey="dashboard"
        userDisplayName={displayName}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        logoutLoading={loading}
        notificationCount={167}
        onOpenNotifications={handleOpenNotifications}
      />
      
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
