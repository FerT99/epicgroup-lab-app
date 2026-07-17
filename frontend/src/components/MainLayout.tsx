import React, { ReactNode } from 'react'
import TopNavigation from './TopNavigation'
import './MainLayout.css'
import { User } from '@supabase/supabase-js'
import { getUserRole } from '../utils/getUserRole'
import { useNavigate, useLocation } from 'react-router-dom'
import { auth } from '../lib/supabase'

interface MainLayoutProps {
    children: ReactNode
    user: User
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, user }) => {
    const userRole = getUserRole(user)
    const displayName = user.user_metadata?.full_name || user.email || 'Usuario'
    const navigate = useNavigate()
    const location = useLocation()
    const activeKey = location.pathname.split('/')[1] || 'dashboard'

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
            <TopNavigation 
                activeKey={activeKey}
                userDisplayName={displayName} 
                userRole={userRole} 
                onNavigate={handleNavigate} 
                onLogout={handleLogout}
                backgroundColor={location.pathname.startsWith('/alumnos') ? '#a3d92a' : undefined}
            />
            <main className="main-layout-main">
                {children}
            </main>
        </div>
    )
}

export default MainLayout
