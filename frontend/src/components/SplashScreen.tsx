import React, { useEffect, useState } from 'react'
import epicLogo from '../assets/epic_.png'
import './SplashScreen.css'

const SplashScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) {
    return null
  }

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <img src={epicLogo} alt="Logo" className="splash-logo" style={{ width: '150px', height: 'auto' }} />
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <div className="splash-text">
          <p>Cargando innovación educativa...</p>
        </div>
      </div>

      {/* Elementos decorativos de fondo */}
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>
    </div>
  )
}

export default SplashScreen
