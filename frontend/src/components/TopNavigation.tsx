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
  userRole?: string // Add role prop
  onNavigate: (path: string) => void
  onLogout?: () => Promise<void> | void
  logoutLoading?: boolean
  notificationCount?: number
  onOpenNotifications?: () => void
  logoDestination?: string
  backgroundColor?: string
}

// Admin navigation items
const ADMIN_NAV_ITEMS: NavItem[] = [
  { key: 'admin-home', label: 'Inicio', path: '/dashboard' },
  { key: 'schools', label: 'Panel administrativo', path: '/admin' },
  { key: 'agenda', label: 'Agenda', path: '/quotes' },
]

// Professor navigation items (current default)
const PROFESSOR_NAV_ITEMS: NavItem[] = [
  { key: 'my-courses', label: 'Inicio', path: '/dashboard' },
  { key: 'tracking', label: 'Mis cursos', path: '/assignments' },
  { key: 'agenda', label: 'Mi agenda', path: '/quotes' },
]

const TopNavigation: React.FC<TopNavigationProps> = ({
  activeKey,
  userDisplayName,
  userRole,
  onNavigate,
  onLogout,
  logoutLoading = false,
  notificationCount = 0,
  onOpenNotifications,
  logoDestination = '/dashboard',
  backgroundColor,
}) => {
  // Select navigation items based on role
  const navItems = userRole === 'admin' ? ADMIN_NAV_ITEMS : PROFESSOR_NAV_ITEMS
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
    <header className="top-navigation" role="banner" style={{ backgroundColor }}>
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
              {navItems.map((item) => {
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

          <div className="top-navigation__right" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <NavbarProfileControls
              userDisplayName={userDisplayName}
              onNavigate={onNavigate}
              onLogout={onLogout}
              logoutLoading={logoutLoading}
              notificationCount={notificationCount}
              onOpenNotifications={onOpenNotifications}
            />
            <button className="hamburger-btn" onClick={() => console.log('Menu opened')} aria-label="Menu">
              <span className="hamburger-icon">=</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default TopNavigation

