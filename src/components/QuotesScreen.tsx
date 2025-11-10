import React, { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'
import './QuotesScreen.css'
import pencilImage from '../assets/pencil.png'
import spaceshipImage from '../assets/spaceship.png'
import foquitoImage from '../assets/foquito.png'
import fondonaranjaImage from '../assets/fondonaranja.png'
import manoamarillaImage from '../assets/manoamarilla.png'
import NavbarProfileControls from './NavbarProfileControls'
import { auth } from '../lib/supabase'

interface QuotesScreenProps {
  user: User
}

const QuotesScreen: React.FC<QuotesScreenProps> = ({ user }) => {
  const navigate = useNavigate()
  const [userQuote, setUserQuote] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await auth.signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleSubmitQuote = () => {
    if (userQuote.trim()) {
      console.log('Nueva frase enviada:', userQuote)
      setUserQuote('')
      // Aquí podrías enviar la frase a la base de datos
    }
  }

  return (
    <div className="quotes-screen">
      {/* Logo EPICGROUP LAB en esquina superior izquierda */}
      <div className="logo-container-top" onClick={() => handleNavigation('/dashboard')}>
        <img src="/src/assets/epic2.png" alt="EPICGROUP LAB" className="main-logo" />
      </div>
      
      {/* Barra de navegación superior */}
      <div className="top-navbar">
        <div className="navbar-content">
          <div className="navbar-left">
          </div>
          
          <div className="navbar-center">
            <nav className="nav-links">
              <button onClick={() => handleNavigation('/my-courses')} className="nav-link">Mis cursos</button>
              <button onClick={() => handleNavigation('/quotes')} className="nav-link active">Frases del día</button>
              <button onClick={() => handleNavigation('#')} className="nav-link">Recordatorio</button>
              <button onClick={() => handleNavigation('/progress')} className="nav-link">Progreso</button>
            </nav>
          </div>
          
          <div className="navbar-right">
            <NavbarProfileControls
              userDisplayName={user.user_metadata?.full_name || user.email || 'Usuario'}
              onNavigate={handleNavigation}
              onLogout={handleLogout}
              logoutLoading={isLoggingOut}
              notificationCount={42}
              onOpenNotifications={() => console.log('Abrir notificaciones')}
            />
          </div>
        </div>
      </div>

      {/* Barra superior púrpura */}
      <div className="top-purple-bar">
        <div className="purple-circle"></div>
      </div>
      
      {/* Header con título */}
      <div className="quotes-header">
        <h1 className="main-title">Frases del día</h1>
        <p className="subtitle">Cada día una idea, una chispa y un recordatorio de que lo simple también puede ser EPIC.</p>
      </div>

      {/* Sección principal con fondo naranja */}
      <div className="main-quotes-section">
        <div className="background-image-container">
          <img src={fondonaranjaImage} alt="Fondo naranja" className="background-image" />
        </div>
        
        {/* Elementos decorativos izquierda */}
        <div className="left-decorations">
          <img src={pencilImage} alt="Lápiz" className="pencil-image" />
          <img src={spaceshipImage} alt="Cohete" className="spaceship-image" />
        </div>
        
        {/* Elementos decorativos derecha */}
        <div className="right-decorations">
          <img src={foquitoImage} alt="Foco" className="foquito-image" />
          <div className="browser-window">
            <div className="browser-header">
              <div className="browser-dots">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
            <div className="browser-content">
              <div className="content-line"></div>
              <div className="content-line"></div>
              <div className="content-line"></div>
            </div>
          </div>
        </div>
        
        {/* Frase principal */}
        <div className="main-quote">
          <p>Tu esfuerzo de hoy es el éxito de mañana</p>
        </div>
        
        {/* Carrusel de frases */}
        <div className="quote-carousel">
          <button className="carousel-arrow left">‹</button>
          <div className="carousel-content">
            <div className="quote-card blue">
              <p>Cree en ti mismo y todo será posible</p>
            </div>
            <div className="quote-card green">
              <p>La educación es el pasaporte hacia el futuro</p>
            </div>
          </div>
          <button className="carousel-arrow right">›</button>
        </div>
      </div>

      {/* Sección de input */}
      <div className="input-section">
        <h3 className="input-title">Escribe aquí tu frase:</h3>
        <p className="input-description">Escribe una frase que te motive, podrías aparecer en esta sección inspirando a los demás</p>
        <div className="input-container">
          <input
            type="text"
            value={userQuote}
            onChange={(e) => setUserQuote(e.target.value)}
            placeholder="Tu frase motivacional..."
            className="quote-input"
          />
          <button className="submit-btn" onClick={handleSubmitQuote}>
            Enviar
          </button>
        </div>
        <img src={manoamarillaImage} alt="Mano amarilla" className="mano-image" />
      </div>
    </div>
  )
}

export default QuotesScreen
