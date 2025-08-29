import React from 'react'
import logoUrl from '../assets/epic2.png'
import './Logo.css'

interface LogoProps {
  size?: 'small' | 'medium' | 'large'
  showSubtitle?: boolean
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', showSubtitle = true }) => {
  const getSize = () => {
    switch (size) {
      case 'small': return { width: 120, height: 48 }
      case 'large': return { width: 240, height: 96 }
      default: return { width: 180, height: 72 }
    }
  }

  const { width, height } = getSize()

  return (
    <div className={`logo logo-${size}`}>
      <img 
        src={logoUrl} 
        alt="EPICGROUP LAB" 
        width={width} 
        height={height}
        className="logo-image"
      />
    </div>
  )
}

export default Logo
