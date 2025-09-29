import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { User } from '@supabase/supabase-js'
import { auth } from './lib/supabase'
import LoginScreen from './components/LoginScreen'
import DashboardScreen from './components/DashboardScreen'
import CourseDetailScreen from './components/CourseDetailScreen'
import ProgressScreen from './components/ProgressScreen'
import QuotesScreen from './components/QuotesScreen'
import './App.css'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar el estado de autenticación al cargar la app
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    )
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" replace /> : <LoginScreen />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <DashboardScreen user={user} /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/course/:courseId" 
            element={user ? <CourseDetailScreen user={user} /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/progress" 
            element={user ? <ProgressScreen user={user} /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/quotes" 
            element={user ? <QuotesScreen user={user} /> : <Navigate to="/login" replace />} 
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
