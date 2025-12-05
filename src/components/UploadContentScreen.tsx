import React from 'react'
import { User } from '@supabase/supabase-js'
import TopNavigation from './TopNavigation'
import { useNavigate } from 'react-router-dom'
import { auth } from '../lib/supabase'
import './UploadContentScreen.css'

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
  const handleOpenNotifications = () => console.log('Abrir notificaciones')

  return (
    <div className="upload-content-screen">
      <TopNavigation
        activeKey="dashboard"
        userDisplayName={displayName}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        logoutLoading={false}
        notificationCount={42}
        onOpenNotifications={handleOpenNotifications}
      />
      
      <main className="upload-content-main">
        <div className="upload-content-container">
          <h1 className="upload-content-title">Subir Contenido</h1>
          <p className="upload-content-description">
            Esta página estará disponible próximamente.
          </p>
        </div>
      </main>
    </div>
  )
}

export default UploadContentScreen

