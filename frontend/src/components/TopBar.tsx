import React from 'react'
import NavbarProfileControls from './NavbarProfileControls'
import './TopBar.css'
import { Search } from 'lucide-react'

interface TopBarProps {
    userDisplayName: string
    userRole?: string
    onLogout?: () => void
    notificationCount?: number
    onOpenNotifications?: () => void
}

const TopBar: React.FC<TopBarProps> = ({
    userDisplayName,
    userRole,
    onLogout,
    notificationCount = 0,
    onOpenNotifications
}) => {
    
    const today = new Date()
    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
    const formattedDate = today.toLocaleDateString('es-ES', dateOptions)
    
    // Capitalize first letter
    const dateStr = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)

    return (
        <header className="top-bar-container">
            <div className="top-bar-left">
                <div className="top-bar-date">
                    <span className="date-icon">📅</span>
                    <span className="date-text">{dateStr}</span>
                </div>
            </div>

            <div className="top-bar-right">
                <div className="search-container">
                    <Search className="search-icon" size={18} />
                    <input type="text" placeholder="Buscar..." className="search-input" />
                </div>
                
                <NavbarProfileControls
                    userDisplayName={userDisplayName}
                    onNavigate={() => {}}
                    onLogout={onLogout}
                    notificationCount={notificationCount}
                    onOpenNotifications={onOpenNotifications}
                />
            </div>
        </header>
    )
}

export default TopBar
