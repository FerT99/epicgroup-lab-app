import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { User } from '@supabase/supabase-js'
import { auth } from './lib/supabase'
import LoginScreen from './components/LoginScreen'
import DashboardScreen from './components/DashboardScreen'
import CourseDetailScreen from './components/CourseDetailScreen'
import ProgressScreen from './components/ProgressScreen'
import QuotesScreen from './components/QuotesScreen'
import CourseMapScreen from './components/CourseMapScreen'
import ProfileScreen from './components/ProfileScreen'
import AdminPanel from './components/AdminPanel'
import MyCoursesScreen from './components/MyCoursesScreen'
import './App.css'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar el estado de autenticación al cargar la app
    const { data: { subscription } } = auth.onAuthStateChange((_event, session) => {
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
            path="/my-courses"
            element={user ? <MyCoursesScreen user={user} /> : <Navigate to="/login" replace />}
          />
          <Route 
            path="/quotes" 
            element={user ? <QuotesScreen user={user} /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/course-map" 
            element={user ? <CourseMapScreen user={user} /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/profile" 
            element={user ? <ProfileScreen user={user} /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/admin" 
            element={<AdminPanel />} 
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
