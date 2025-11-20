import React from 'react'
import NavbarProfileControls from './NavbarProfileControls'
import logoImage from '../assets/epic2.png'
import './TopNavigation.css'

interface NavItem {
  key: string
  label: string
  path: string
  disabled?: boolean
}

interface TopNavigationProps {
  activeKey?: string
  userDisplayName: string
  onNavigate: (path: string) => void
  onLogout?: () => Promise<void> | void
  logoutLoading?: boolean
  notificationCount?: number
  onOpenNotifications?: () => void
  logoDestination?: string
}

const NAV_ITEMS: NavItem[] = [
  { key: 'my-courses', label: 'Inicio', path: '/dashboard' },
  { key: 'quotes', label: 'Frases del día', path: '/quotes' },
  { key: 'reminder', label: 'Recordatorio', path: '#', disabled: true },
  { key: 'progress', label: 'Mis cursos', path: '/progress' },
]

const TopNavigation: React.FC<TopNavigationProps> = ({
  activeKey,
  userDisplayName,
  onNavigate,
  onLogout,
  logoutLoading = false,
  notificationCount = 0,
  onOpenNotifications,
  logoDestination = '/dashboard',
}) => {
  const handleLogoClick = () => {
    if (logoDestination) {
      onNavigate(logoDestination)
    }
  }

  const handleNavClick = (item: NavItem) => {
    if (item.disabled || !item.path || item.path === '#') {
      return
    }
    onNavigate(item.path)
  }

  return (
    <header className="top-navigation" role="banner">
      <div className="top-navigation__bar">
        <div className="top-navigation__content">
          <button
            type="button"
            className="top-navigation__logo"
            onClick={handleLogoClick}
            aria-label="Ir al dashboard"
          >
            <img src={logoImage} alt="EPICGROUP LAB" className="top-navigation__logo-image" />
          </button>

          <div className="top-navigation__center">
            <nav className="top-navigation__links" aria-label="Navegación principal">
              {NAV_ITEMS.map((item) => {
                const isActive = item.key === activeKey
                return (
                  <button
                    key={item.key}
                    type="button"
                    className={[
                      'top-navigation__link',
                      isActive ? 'top-navigation__link--active' : '',
                      item.disabled ? 'top-navigation__link--disabled' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => handleNavClick(item)}
                    disabled={item.disabled}
                  >
                    {item.label}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="top-navigation__right">
            <NavbarProfileControls
              userDisplayName={userDisplayName}
              onNavigate={onNavigate}
              onLogout={onLogout}
              logoutLoading={logoutLoading}
              notificationCount={notificationCount}
              onOpenNotifications={onOpenNotifications}
            />
          </div>
        </div>
      </div>
    </header>
  )
}

export default TopNavigation

