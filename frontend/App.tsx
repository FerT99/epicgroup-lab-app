import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { User } from '@supabase/supabase-js'
import { auth, supabase } from './src/lib/supabase'
import LoginScreen from './src/components/LoginScreen'
import DashboardScreen from './src/components/DashboardScreen'
import CourseDetailScreen from './src/components/CourseDetailScreen'
import ProgressScreen from './src/components/ProgressScreen'
import QuotesScreen from './src/components/QuotesScreen'
import StudentsScreen from './src/components/StudentsScreen'
import StudentProgressScreen from './src/components/StudentProgressScreen'
import GradesScreen from './src/components/GradesScreen'
import CourseMapScreen from './src/components/CourseMapScreen'
import ProfileScreen from './src/components/ProfileScreen'
import AdminPanel from './src/components/AdminPanel'
import AssignmentsScreen from './src/components/AssignmentsScreen'
import HierarchyConfig from './src/components/HierarchyConfig'
import SchoolDetailScreen from './src/components/SchoolDetailScreen'
import CoursePdfViewerScreen from './src/components/CoursePdfViewerScreen'
import UploadContentScreen from './src/components/UploadContentScreen'
import LandingPage from './src/components/LandingPage'
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

  // Efecto separado para hidratar el rol si falta
  useEffect(() => {
    const hydrateUserRole = async () => {
      if (user && user.email && !user.user_metadata?.role) {
        try {
          const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('email', user.email)
            .single()

          if (profile?.role) {
            console.log('Rol hidratado:', profile.role)
            setUser(currentUser => {
              if (!currentUser) return null
              return {
                ...currentUser,
                user_metadata: {
                  ...currentUser.user_metadata,
                  role: profile.role
                }
              }
            })
          }
        } catch (error) {
          console.error('Error hidratando rol:', error)
        }
      }
    }

    hydrateUserRole()
  }, [user?.email]) // Se ejecuta cuando cambia el usuario

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
          <Route
            path="/alumnos"
            element={user ? <StudentsScreen user={user} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/alumnos/:studentId"
            element={user ? <StudentProgressScreen user={user} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/calificaciones"
            element={user ? <GradesScreen user={user} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/course-map"
            element={user ? <CourseMapScreen user={user} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/course/:courseId/content/:resourceId"
            element={user ? <CoursePdfViewerScreen user={user} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/profile"
            element={user ? <ProfileScreen user={user} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin"
            element={<AdminPanel />}
          />
          <Route
            path="/admin/hierarchy"
            element={user ? <HierarchyConfig user={user} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin/school/:centerId"
            element={user ? <SchoolDetailScreen user={user} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/upload-content"
            element={user && user.user_metadata?.role === 'admin' ? <UploadContentScreen user={user} /> : <Navigate to="/dashboard" replace />}
          />
          <Route
            path="/assignments"
            element={user ? <AssignmentsScreen user={user} /> : <Navigate to="/login" replace />}
          />
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
