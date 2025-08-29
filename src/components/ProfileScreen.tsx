import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../lib/supabase'
import { User } from '@supabase/supabase-js'
import Logo from './Logo'
import astronautUrl from '../assets/astronauta.png'
import './ProfileScreen.css'

interface ProfileScreenProps {
  user: User
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user }) => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

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

  const handleReturn = () => {
    navigate('/login')
  }

  return (
    <div className="profile-screen">
      <div className="container">
        <div className="profile-content">
          <Logo size="medium" />
          
          <div className="profile-section">
            <div className="avatar-container">
              <div className="avatar avatar-with-image">
                <img 
                  src={astronautUrl} 
                  alt="Astronauta" 
                  className="astronaut-image-profile"
                />
              </div>
            </div>

            <div className="user-info">
              <h2 className="user-name">
                {user.user_metadata?.full_name || 'Usuario'}
              </h2>
              <p className="user-email">{user.email}</p>
            </div>

            <div className="profile-actions">
              <button
                className="btn btn-primary"
                onClick={handleLogout}
                disabled={loading}
              >
                {loading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
              </button>
            </div>
          </div>

          <div className="return-button">
            <button className="btn btn-icon btn-secondary" onClick={handleReturn}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M8 12L20 8L12 12L20 16L8 12Z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <span>regresar</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileScreen
