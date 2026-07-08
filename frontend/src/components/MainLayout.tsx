import React, { ReactNode } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import './MainLayout.css'
import { User } from '@supabase/supabase-js'
import { getUserRole } from '../utils/getUserRole'

import { useNavigate } from 'react-router-dom'
import { auth } from '../lib/supabase'

interface MainLayoutProps {
    children: ReactNode
    user: User
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, user }) => {
    const userRole = getUserRole(user)
    const displayName = user.user_metadata?.full_name || user.email || 'Usuario'
    const navigate = useNavigate()

    const handleNavigate = (path: string) => {
        navigate(path)
    }

    const handleLogout = async () => {
        try {
            await auth.signOut()
            navigate('/login')
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    return (
        <div className="main-layout-wrapper">
            <div className="main-layout-container">
                <Sidebar 
                    userRole={userRole} 
                    onNavigate={handleNavigate} 
                />
                <div className="main-layout-content-area">
                    <TopBar 
                        userDisplayName={displayName} 
                        userRole={userRole} 
                        onLogout={handleLogout} 
                        onOpenNotifications={() => console.log('Abrir notificaciones')}
                        notificationCount={0}
                    />
                    <main className="main-layout-main">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    )
}

export default MainLayout
