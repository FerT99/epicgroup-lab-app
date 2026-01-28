import React, { useState } from 'react'
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
import image40 from '../assets/image40.png'
import image41 from '../assets/image41.png'
import image42 from '../assets/image42.png'
import image43 from '../assets/image43.png'
import TopNavigation from './TopNavigation'

// --- Interfaces ---
interface Course {
  id: number
  title: string
  description: string
  completedSteps: number
  totalSteps: number
  image?: string
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

// --- Mock Data ---
const MOCK_COURSES: Course[] = [
  {
    id: 1,
    title: 'Astronomía Básica',
    description: 'Explora los fundamentos del universo',
    completedSteps: 2,
    totalSteps: 5,
  },
  {
    id: 2,
    title: 'Biología Marina',
    description: 'Descubre los secretos del océano',
    completedSteps: 0,
    totalSteps: 4,
  },
  {
    id: 3,
    title: 'Física Cuántica',
    description: 'Entiende lo más pequeño del universo',
    completedSteps: 4,
    totalSteps: 6,
  },
]

const MOCK_PLANETS: Record<number, Planet[]> = {
  1: [
    { id: 101, number: 1, stars: 3, completed: true, image: image30, position: { top: '80%', left: '20%' }, title: 'Introducción' },
    { id: 102, number: 2, stars: 2, completed: true, image: image36, position: { top: '60%', left: '50%' }, title: 'Sistema Solar' },
    { id: 103, number: 3, stars: 0, completed: false, image: image37, position: { top: '35%', left: '30%' }, title: 'Estrellas' },
    { id: 104, number: 4, stars: 0, completed: false, image: image38, position: { top: '20%', left: '70%' }, title: 'Galaxias' },
    { id: 105, number: 5, stars: 0, completed: false, image: image39, position: { top: '10%', left: '40%' }, title: 'Agujeros Negros' },
  ],
  2: [
    { id: 201, number: 1, stars: 0, completed: false, image: image40, position: { top: '75%', left: '25%' }, title: 'Océanos' },
    { id: 202, number: 2, stars: 0, completed: false, image: image41, position: { top: '50%', left: '60%' }, title: 'Vida Marina' },
    { id: 203, number: 3, stars: 0, completed: false, image: image42, position: { top: '25%', left: '40%' }, title: 'Conservación' },
    { id: 204, number: 4, stars: 0, completed: false, image: image43, position: { top: '10%', left: '75%' }, title: 'Futuro' },
  ],
  3: [
    { id: 301, number: 1, stars: 3, completed: true, image: image30, position: { top: '80%', left: '20%' }, title: 'Átomos' },
    { id: 302, number: 2, stars: 3, completed: true, image: image36, position: { top: '65%', left: '50%' }, title: 'Partículas' },
    { id: 303, number: 3, stars: 2, completed: true, image: image37, position: { top: '45%', left: '30%' }, title: 'Ondas' },
    { id: 304, number: 4, stars: 1, completed: true, image: image38, position: { top: '30%', left: '70%' }, title: 'Superposición' },
    { id: 305, number: 5, stars: 0, completed: false, image: image39, position: { top: '15%', left: '45%' }, title: 'Entrelazamiento' },
    { id: 306, number: 6, stars: 0, completed: false, image: image40, position: { top: '5%', left: '80%' }, title: 'Computación' },
  ]
}

const MOCK_STUDENTS: Record<number, Student[]> = {
  1: [
    { id: 's1', name: 'Ana Garcia', progress: 40, avatar: 'AG' },
    { id: 's2', name: 'Carlos Lopez', progress: 80, avatar: 'CL' },
    { id: 's3', name: 'Beatriz Mendez', progress: 20, avatar: 'BM' },
  ],
  2: [
    { id: 's4', name: 'Daniela Ruiz', progress: 0, avatar: 'DR' },
    { id: 's5', name: 'Eduardo Silva', progress: 10, avatar: 'ES' },
  ],
  3: [
    { id: 's6', name: 'Fernando Torres', progress: 95, avatar: 'FT' },
    { id: 's7', name: 'Gabriela Paz', progress: 60, avatar: 'GP' },
    { id: 's8', name: 'Hugo Boss', progress: 100, avatar: 'HB' },
    { id: 's9', name: 'Irene Adler', progress: 50, avatar: 'IA' },
  ]
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

  const userRole = getUserRole(user)

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
    return MOCK_PLANETS[selectedCourse.id] || []
  }

  const getActiveStudents = () => {
    if (!selectedCourse) return []
    return MOCK_STUDENTS[selectedCourse.id] || []
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
          <div className="courses-grid">
            {MOCK_COURSES.map((course) => (
              <div
                key={course.id}
                className="course-card"
                onClick={() => handleOpenCourse(course)}
              >
                <h3 className="course-title">{course.title}</h3>
                <p style={{ color: '#666', marginBottom: '15px' }}>{course.description}</p>

                {/* Progress Bar */}
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
            ))}
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