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
import AssignmentsScreen from './src/components/AssignmentsScreen'
import HierarchyConfig from './src/components/HierarchyConfig'
import SchoolDetailScreen from './src/components/SchoolDetailScreen'
import CourseFormScreen from './src/components/CourseFormScreen'
import CoursePdfViewerScreen from './src/components/CoursePdfViewerScreen'
import UploadContentScreen from './src/components/UploadContentScreen'
import CourseContentScreen from './src/components/CourseContentScreen'
import MainLayout from './src/components/MainLayout'
// import LandingPage from './src/components/LandingPage'
import './App.css'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    const loggedUser = session?.user ?? null
    setUser(loggedUser)
    setLoading(false)

    if (loggedUser) {
      // Defer to next tick to avoid deadlocking with getSession()'s internal lock
      setTimeout(async () => {
        try {
          const { data } = await supabase.from('users').select('role').eq('id', loggedUser.id).single()
          if (data?.role) {
            setUser(prev => {
              if (!prev) return prev
              return {
                ...prev,
                user_metadata: { ...prev.user_metadata, role: data.role }
              }
            })
          }
        } catch (err) {
          console.error("Error fetching user role:", err)
        }
      }, 0)
    }
  }).catch((err) => {
    console.error("getSession failed:", err)
    setLoading(false)
  })

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    const loggedUser = session?.user ?? null
    setUser(loggedUser)

    if (loggedUser) {
      setTimeout(async () => {
        try {
          const { data } = await supabase.from('users').select('role').eq('id', loggedUser.id).single()
          if (data?.role) {
            setUser(prev => {
              if (!prev) return prev
              return {
                ...prev,
                user_metadata: { ...prev.user_metadata, role: data.role }
              }
            })
          }
        } catch (err) {
          console.error("Error fetching user role on state change:", err)
        }
      }, 0)
    }
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
            path="/*"
            element={
              user ? (
                <MainLayout user={user}>
                  <Routes>
                    <Route path="/dashboard" element={<DashboardScreen user={user} />} />
                    <Route path="/course/:courseId" element={<CourseDetailScreen user={user} />} />
                    <Route path="/progress" element={<ProgressScreen user={user} />} />
                    <Route path="/quotes" element={<QuotesScreen user={user} />} />
                    <Route path="/alumnos" element={<StudentsScreen user={user} />} />
                    <Route path="/alumnos/:studentId" element={<StudentProgressScreen user={user} />} />
                    <Route path="/calificaciones" element={<GradesScreen user={user} />} />
                    <Route path="/course-map" element={<CourseMapScreen user={user} />} />
                    <Route path="/course/:courseId/content/:resourceId" element={<CoursePdfViewerScreen user={user} />} />
                    <Route path="/profile" element={<ProfileScreen user={user} />} />
                    <Route path="/admin" element={<HierarchyConfig user={user} />} />
                    <Route path="/admin/school/:centerId" element={<SchoolDetailScreen user={user} />} />
                    <Route path="/admin/school/:centerId/grade/:gradeId/course/new" element={<CourseFormScreen user={user} />} />
                    <Route path="/admin/school/:centerId/grade/:gradeId/course/:courseId/edit" element={<CourseFormScreen user={user} />} />
                    <Route path="/admin/school/:centerId/grade/:gradeId/course/:courseId/content" element={<CourseContentScreen user={user} />} />
                    <Route path="/upload-content" element={user.user_metadata?.role === 'admin' ? <UploadContentScreen user={user} /> : <Navigate to="/dashboard" replace />} />
                    <Route path="/assignments" element={<AssignmentsScreen user={user} />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </MainLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
