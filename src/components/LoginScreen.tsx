import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../lib/supabase'
import Logo from './Logo'
import astronautUrl from '../assets/astronauta.png'
import './LoginScreen.css'

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: signInError } = await auth.signIn(email, password)
      
      if (signInError) {
        setError(signInError.message)
      } else if (data.user) {
        // Login exitoso, redirigir al dashboard
        navigate('/dashboard')
      }
    } catch (err) {
      setError('Error inesperado. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Por favor ingresa tu email primero')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error: resetError } = await auth.resetPassword(email)
      
      if (resetError) {
        setError(resetError.message)
      } else {
        setError('Se envió un enlace de recuperación a tu email')
      }
    } catch (err) {
      setError('Error inesperado. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <div className="container">
        <div className="login-content">
          <Logo size="large" />
          
          <div className="avatar-container">
            <div className="avatar">
              <img 
                src={astronautUrl} 
                alt="Astronauta" 
                className="astronaut-image"
              />
            </div>
          </div>

          <form className="form" onSubmit={handleLogin}>
            <div className="input-group">
              <input
                type="email"
                className="input"
                placeholder="usuario"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="input-group">
              <input
                type="password"
                className="input"
                placeholder="contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="forgot-password">
              <button
                type="button"
                className="forgot-link"
                onClick={handleForgotPassword}
                disabled={loading}
              >
                ¿olvidaste la contraseña?
              </button>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Accediendo...' : 'acceder'}
            </button>
          </form>
        </div>

        {/* Cards de cursos activos */}
        <div className="courses-section">
          <h2 className="courses-title">Cursos Activos</h2>
          <div className="courses-grid">
            <div className="course-card">
              <div className="course-image">
                <div className="course-icon">🚀</div>
              </div>
              <div className="course-info">
                <h3 className="course-name">Desarrollo Web</h3>
                <p className="course-description">Aprende HTML, CSS y JavaScript</p>
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
                <h3 className="course-name">Diseño UX/UI</h3>
                <p className="course-description">Principios de diseño centrado en el usuario</p>
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
                <h3 className="course-name">React Native</h3>
                <p className="course-description">Desarrollo de apps móviles</p>
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
  )
}

export default LoginScreen
