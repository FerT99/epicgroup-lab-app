import React, { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'
import { getUserRole } from '../utils/getUserRole'
import './ProfessorDashboard.css'

interface Course {
  id: string
  title: string
  description: string
  completedSteps: number
  totalSteps: number
  gradeId?: string
  centerId?: string
  centerName?: string
  isAdminCenter?: boolean
}

interface ProfessorDashboardProps {
  user: User
}

const ProfessorDashboard: React.FC<ProfessorDashboardProps> = ({ user }) => {
  const navigate = useNavigate()
  const userRole = getUserRole(user)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch Courses
  useEffect(() => {
    const fetchProfessorCourses = async () => {
      setLoading(true)
      try {
        let allCourses: Course[] = []

        if (userRole === 'student') {
          const studentRes = await fetch(`http://localhost:3001/api/students/${user.id}/courses`)
          if (!studentRes.ok) throw new Error('Error fetching student courses')
          const subjects = await studentRes.json()

          allCourses = subjects.map((subject: any) => ({
            id: subject.id,
            title: subject.name,
            description: `${subject.grade_name || 'Sin grado'} • ${subject.short_name || 'Sin código'}`,
            completedSteps: Math.floor(Math.random() * 100), // Mock progress
            totalSteps: 100,
            gradeId: subject.grade_id,
            centerId: subject.center_id,
            centerName: subject.center_name
          }))
        } else if (userRole === 'tutor') {
          const tutorRes = await fetch(`http://localhost:3001/api/tutors/${user.id}/courses`)
          if (!tutorRes.ok) throw new Error('Error fetching tutor courses')
          const subjects = await tutorRes.json()

          allCourses = subjects.map((subject: any) => ({
            id: subject.id,
            title: subject.name,
            description: `${subject.grade_name || 'Sin grado'} • ${subject.short_name || 'Sin código'}`,
            completedSteps: Math.floor(Math.random() * 100), // Mock progress
            totalSteps: 100,
            gradeId: subject.grade_id,
            centerId: subject.center_id,
            centerName: subject.center_name
          }))
        } else if (userRole === 'admin') {
          const adminCentersRes = await fetch(`http://localhost:3001/api/admin/centers`)
          if (adminCentersRes.ok) {
            const adminCenters = await adminCentersRes.json()
            allCourses = adminCenters.map((center: any) => ({
              id: center.id,
              title: center.name,
              description: 'Centro Educativo',
              completedSteps: 100,
              totalSteps: 100,
              centerId: center.id,
              centerName: center.name,
              isAdminCenter: true // flag to know it's a center card
            }))
          }
        } else {
          const coursesRes = await fetch(`http://localhost:3001/api/professors/${user.id}/courses`)
          if (!coursesRes.ok) throw new Error('Error fetching professor courses')
          allCourses = await coursesRes.json()
        }
        // ------------------------------------------------

        setCourses(allCourses)
      } catch (err: any) {
        console.error('Error loading courses:', err)
      } finally {
        setLoading(false)
      }
    }

    if (userRole === 'professor' || userRole === 'admin' || userRole === 'student' || userRole === 'tutor') {
      fetchProfessorCourses()
    }
  }, [user, userRole])

  // Get current date formatted
  const today = new Date()
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  const formattedDate = today.toLocaleDateString('es-ES', options).replace(',', '')
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)

  return (
    <div className="professor-dashboard-container">

      {/* LEFT COLUMN: Main Content */}
      <div className="prof-main-col">

        {/* Classes Section */}
        <div>
          <h2 className="section-title-modern">{userRole === 'admin' ? 'Centros educativos' : userRole === 'tutor' ? 'Cursos de tu(s) hijo(s)' : 'Tus cursos'}</h2>
          <div className="classes-grid">
            {loading ? (
              <p style={{ gridColumn: '1 / -1' }}>Cargando...</p>
            ) : courses.length === 0 ? (
              <p style={{ gridColumn: '1 / -1', color: '#64748b' }}>No hay cursos asignados actualmente.</p>
            ) : (
              courses.map(course => (
                <div key={course.id} className="class-card" onClick={() => {
                  if (course.isAdminCenter) {
                    navigate(`/admin/school/${course.centerId}`)
                  } else {
                    navigate(`/progress`, { state: { selectedCourse: course } })
                  }
                }}>
                  <div className="class-header">
                    <h3>{course.title}</h3>
                    <div style={{ opacity: 0.7 }}>{course.isAdminCenter ? '🏫' : '📚'}</div>
                  </div>
                  <div className="class-stats">
                    <div className="stat-row">
                      <span className="stat-icon">{course.isAdminCenter ? '📍' : '🎓'}</span>
                      <span>{course.description}</span>
                    </div>
                    {!course.isAdminCenter && (
                      <div className="stat-row">
                        <span className="stat-icon">📊</span>
                        <span>{Math.round((course.completedSteps / course.totalSteps) * 100)}% Rendimiento</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

          </div>
        </div>

        {/* Middle Section: Notifications & ToDo */}
        <div className="middle-section">
          <div>
            <h2 className="section-title-modern">Notificaciones</h2>
            <div className="notif-card" style={{ justifyContent: 'center', color: '#94a3b8', border: '1px dashed #cbd5e1', background: 'transparent', boxShadow: 'none' }}>
              <p style={{ margin: 0 }}>No tienes notificaciones recientes</p>
            </div>
          </div>

          <div>
            <h2 className="section-title-modern">Para hacer hoy</h2>
            <div className="notif-card" style={{ justifyContent: 'center', color: '#94a3b8', border: '1px dashed #cbd5e1', background: 'transparent', boxShadow: 'none' }}>
              <p style={{ margin: 0 }}>No hay tareas pendientes para hoy</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Sidebar Schedule */}
      <div className="prof-sidebar-col">
        <h2 className="section-title-modern" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>Horario</h2>

        <div className="schedule-list" style={{ marginTop: '2rem', textAlign: 'center', color: '#94a3b8' }}>
          <p>No tienes clases programadas para el día de hoy.</p>
        </div>
      </div>

    </div>
  )
}

export default ProfessorDashboard
