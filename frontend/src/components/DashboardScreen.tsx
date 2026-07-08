import React, { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'
import { auth } from '../lib/supabase'
import { getUserRole } from '../utils/getUserRole'
import './DashboardScreen.css'
import astronautaImage from '../assets/image10.png'
import elementoDecorativo1 from '../assets/image11.png'
import elementoDecorativo2 from '../assets/image_9.png'
import ProfessorDashboard from './ProfessorDashboard'

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
  const userRole = getUserRole(user)
  const handleOpenNotifications = () => console.log('Abrir notificaciones')
  const showProfessorDashboard = ['professor', 'student', 'admin', 'tutor'].includes(userRole)

return (
  <div className={`dashboard-screen ${showProfessorDashboard ? 'prof-dashboard' : ''}`}>
    <div className="dashboard-content" style={showProfessorDashboard ? { padding: 0 } : {}}>
      {showProfessorDashboard ? (
        <ProfessorDashboard user={user} />
      ) : (
          /* Sección de bienvenida con fondo morado para estudiantes u otros roles */
          <div className="welcome-section">
            <div className="welcome-content">
              <div className="welcome-text">
                <h1 className="welcome-title">¡Bienvenid@! </h1>
                <h2 className="user-name">{user.user_metadata?.full_name || user.email}</h2>
                <div className="progress-info">
                  <span className="medal-icon">🏅</span>
                  <p className="progress-text" color="white">¡Sigue así, estás más cerca de llegar al siguiente nivel!</p>
                </div>
                <button className="level-up-btn" onClick={() => navigate('/progress')}>Ver mi mapa</button>
              </div>
            </div>

            {/* Elementos espaciales */}
            <div className="space-composition">
              <img src={astronautaImage} alt="Astronauta" className="astronaut-image_fl" />
              <img src={elementoDecorativo1} alt="Elemento decorativo" className="space-image_Element_E" />
              <img src={elementoDecorativo2} alt="Elemento decorativo" className="space-image_green" />
            </div>
          </div>
        )}
    </div>
  </div>
)
}

export default DashboardScreen
