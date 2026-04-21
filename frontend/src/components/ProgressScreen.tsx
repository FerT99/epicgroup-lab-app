import React, { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'
import { auth } from '../lib/supabase'
import { getUserRole } from '../utils/getUserRole'
import './ProgressScreen.css'
import image30 from '../assets/image30.png'
import image36 from '../assets/image36.png'
import image37 from '../assets/image37.png'
import image38 from '../assets/image38.png'
import image39 from '../assets/image39.png'
import TopNavigation from './TopNavigation'

// --- Interfaces ---
interface Course {
  id: number | string // Allow string IDs from backend
  title: string
  description: string
  completedSteps: number
  totalSteps: number
  image?: string
  gradeId?: string
  centerId?: string
  centerName?: string
}

interface Planet {
  id: number
  number: number
  stars: number
  completed: boolean
  image: string
  position: { top: string; left: string }
  title: string
}

interface Student {
  id: string
  name: string
  progress: number
  avatar: string
}

interface Note {
  id: string
  text: string
  date: string
}

// --- Mock Data (kept for fallback or students) ---
const MOCK_PLANETS: Record<number, Planet[]> = {
  1: [
    { id: 101, number: 1, stars: 3, completed: true, image: image30, position: { top: '80%', left: '20%' }, title: 'Introducción' },
    { id: 102, number: 2, stars: 2, completed: true, image: image36, position: { top: '60%', left: '50%' }, title: 'Sistema Solar' },
    { id: 103, number: 3, stars: 0, completed: false, image: image37, position: { top: '35%', left: '30%' }, title: 'Estrellas' },
    { id: 104, number: 4, stars: 0, completed: false, image: image38, position: { top: '20%', left: '70%' }, title: 'Galaxias' },
    { id: 105, number: 5, stars: 0, completed: false, image: image39, position: { top: '10%', left: '40%' }, title: 'Agujeros Negros' },
  ]
}

const MOCK_STUDENTS: Record<string, Student[]> = {
  // Using string keys for consistency with Course ID
}

interface ProgressScreenProps {
  user: User
}

const ProgressScreen: React.FC<ProgressScreenProps> = ({ user }) => {
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [activeTab, setActiveTab] = useState<'map' | 'students'>('map')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [studentNotes, setStudentNotes] = useState<Record<string, Note[]>>({})
  const [newNote, setNewNote] = useState('')

  // Real Data State
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const userRole = getUserRole(user)

  // Fetch Courses for Professor
  useEffect(() => {
    const fetchProfessorCourses = async () => {
      if (userRole !== 'professor' && userRole !== 'admin') return // For now only handle professor logic here

      setLoading(true)
      try {
        // 1. Get assigned centers
        const centersRes = await fetch(`http://localhost:3001/api/professors/${user.id}/centers`)
        if (!centersRes.ok) throw new Error('Error fetching centers')
        const centers = await centersRes.json()

        let allCourses: Course[] = []

        // 2. Get hierarchy for each center
        for (const center of centers) {
          const hierarchyRes = await fetch(`http://localhost:3001/api/admin/centers/${center.id}/hierarchy`)
          if (!hierarchyRes.ok) continue

          const hierarchy = await hierarchyRes.json()
          const grades = hierarchy.grades || []

          // Flatten sections to courses
          grades.forEach((grade: any) => {
            const sections = grade.sections || []
            sections.forEach((section: any) => {
              allCourses.push({
                id: section.id,
                title: `${section.name} - ${grade.name}`, // "Section Name - Grade Name"
                description: `${center.name} • ${section.short_name || 'Sin código'}`,
                completedSteps: 0, // Logic to be implemented
                totalSteps: 5, // Default for now
                gradeId: grade.id,
                centerId: center.id,
                centerName: center.name
              })
            })
          })
        }

        setCourses(allCourses)
      } catch (err: any) {
        console.error('Error loading courses:', err)
        setError('No se pudieron cargar los cursos asignados')
      } finally {
        setLoading(false)
      }
    }

    if (user && (userRole === 'professor' || userRole === 'admin')) {
      fetchProfessorCourses()
    }
  }, [user, userRole])

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await auth.signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleOpenCourse = (course: Course) => {
    setSelectedCourse(course)
    setActiveTab('map') // Reset to map tab when opening a course
  }

  const handleBackToCourses = () => {
    setSelectedCourse(null)
  }

  const getActivePlanets = () => {
    if (!selectedCourse) return []
    // TODO: Fetch real content/planets for the course/grade
    return MOCK_PLANETS[1] || [] // Fallback to demo planets
  }

  const getActiveStudents = () => {
    if (!selectedCourse) return []
    // TODO: Fetch real students enrolled in this section
    return MOCK_STUDENTS[selectedCourse.id.toString()] || []
  }

  const handleAddNote = () => {
    if (!selectedStudent || !newNote.trim()) return

    const note: Note = {
      id: Date.now().toString(),
      text: newNote,
      date: new Date().toLocaleDateString()
    }

    setStudentNotes(prev => ({
      ...prev,
      [selectedStudent.id]: [...(prev[selectedStudent.id] || []), note]
    }))
    setNewNote('')
  }

  return (
    <div className="progress-screen">
      <TopNavigation
        activeKey="progress"
        userDisplayName={user.user_metadata?.full_name || user.email || 'Usuario'}
        userRole={userRole}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        logoutLoading={isLoggingOut}
        notificationCount={0}
        onOpenNotifications={() => console.log('Abrir notificaciones')}
      />

      {!selectedCourse ? (
        <div className="progress-content">
          <h1 className="progress-title">Mis cursos</h1>

          {loading && <p style={{ color: 'white', opacity: 0.7 }}>Cargando cursos...</p>}
          {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}

          <div className="courses-grid">
            {!loading && courses.length === 0 ? (
              <div className="empty-state-courses" style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '40px',
                color: 'white'
              }}>
                <p style={{ fontSize: '18px', fontWeight: 500, marginBottom: '8px' }}>¡Todavía no tienes cursos!</p>
                <p style={{ fontSize: '14px', opacity: 0.8 }}>Pronto verás tus cursos asignados aquí.</p>
              </div>
            ) : (
              courses.map((course) => (
                <div
                  key={course.id}
                  className="course-card"
                  onClick={() => handleOpenCourse(course)}
                >
                  <h3 className="course-title">{course.title}</h3>
                  <p style={{ color: '#666', marginBottom: '15px' }}>{course.description}</p>

                  {/* Progress Bar - Visual Placeholder until real progress logic */}
                  <div className="progress-bar">
                    {Array.from({ length: course.totalSteps }, (_, index) => {
                      const stepNumber = index + 1
                      const isCompleted = stepNumber <= course.completedSteps
                      return (
                        <div key={stepNumber} className="progress-step-container">
                          <div className={`progress-step ${isCompleted ? 'completed' : 'pending'}`}>
                            <span className="step-number">{stepNumber.toString().padStart(2, '0')}</span>
                          </div>
                          {index < course.totalSteps - 1 && (
                            <div className={`progress-line ${isCompleted ? 'completed' : 'pending'}`}></div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <button className="complete-course-btn">
                    Ver Curso ►
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Admin/Professor Section */}
          {userRole === 'admin' && (
            <div className="professor-courses-section">
              <h2 className="professor-section-title">Gestión de Contenido</h2>
              <div className="professor-courses-content">
                <button
                  className="upload-content-btn"
                  onClick={() => navigate('/upload-content')}
                >
                  Subir contenido
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // --- FULL SCREEN DETAIL VIEW ---
        <div className="full-screen-detail-view">
          <div className="detail-header-full">
            <div className="header-left">
              <button className="back-btn-full" onClick={handleBackToCourses}>
                ← Volver
              </button>
              <h1 className="detail-title-full">{selectedCourse.title}</h1>
            </div>

            <div className="detail-tabs-full">
              <button
                className={`tab-btn-full ${activeTab === 'map' ? 'active' : ''}`}
                onClick={() => setActiveTab('map')}
              >
                Mapa
              </button>
              <button
                className={`tab-btn-full ${activeTab === 'students' ? 'active' : ''}`}
                onClick={() => setActiveTab('students')}
              >
                Alumnos
              </button>
            </div>
          </div>

          {activeTab === 'map' && (
            <div className="full-map-container">
              <div className="space-background">
                <div className="stars"></div>
                <div className="nebula"></div>
              </div>

              <div className="alien-terrain"></div>

              <svg className="connection-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path
                  d="M82,75 Q68,65 68,50 Q48,45 48,65 Q22,55 12,55 Q12,35 12,35 Q32,25 32,20 Q12,15 12,15"
                  stroke="#FFC000"
                  strokeWidth="0.5"
                  fill="none"
                  strokeDasharray="2,2"
                  className="main-path"
                />
              </svg>

              {getActivePlanets().map((planet) => (
                <div
                  key={planet.id}
                  className={`planet-container ${planet.completed ? 'completed' : 'locked'}`}
                  style={{ top: planet.position.top, left: planet.position.left }}
                >
                  <div className="planet-frame">
                    <img
                      src={planet.image}
                      alt={`Planeta ${planet.number}`}
                      className="planet-image"
                    />
                    <div className="planet-number">{planet.number}</div>
                    <div className="planet-stars">
                      {Array.from({ length: 3 }, (_, index) => (
                        <div
                          key={index}
                          className={`star ${index < planet.stars ? 'filled' : 'empty'}`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <div className="rocket-container">
                <div className="rocket">
                  <div className="rocket-nose"></div>
                  <div className="rocket-body">
                    <div className="rocket-window"></div>
                  </div>
                  <div className="rocket-fins"></div>
                  <div className="rocket-engine">
                    <div className="engine-glow"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="full-students-container">
              <div className="students-list-header">
                <h3>Progreso de Alumnos</h3>
                <span>Total: {getActiveStudents().length}</span>
              </div>
              {getActiveStudents().length === 0 ? (
                <p>No hay alumnos inscritos en este curso.</p>
              ) : (
                <div className="students-grid-full">
                  {getActiveStudents().map(student => (
                    <div
                      key={student.id}
                      className="student-card-full"
                      onClick={() => setSelectedStudent(student)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="student-avatar-full">{student.avatar}</div>
                      <div className="student-info-full">
                        <div className="student-name">{student.name}</div>
                        <div className="student-progress-text">{student.progress}% Completado</div>
                        <div className="progress-bar-mini">
                          <div
                            className="progress-fill-mini"
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Student Notes Modal */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-student-info">
                <div className="student-avatar-modal">{selectedStudent.avatar}</div>
                <div>
                  <h3 className="modal-student-name">{selectedStudent.name}</h3>
                  <span className="modal-student-progress">{selectedStudent.progress}% Completado</span>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedStudent(null)}>×</button>
            </div>

            <div className="modal-body">
              <h4 className="notes-title">Notas y Comentarios</h4>

              <div className="notes-list">
                {(studentNotes[selectedStudent.id] || []).length === 0 ? (
                  <p className="no-notes">No hay notas registradas</p>
                ) : (
                  (studentNotes[selectedStudent.id] || []).map(note => (
                    <div key={note.id} className="note-item">
                      <p className="note-text">{note.text}</p>
                      <span className="note-date">{note.date}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="add-note-form">
                <textarea
                  className="note-input"
                  placeholder="Escribe una nota..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleAddNote()
                    }
                  }}
                />
                <button
                  className="add-note-btn"
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                >
                  Agregar Nota
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProgressScreen