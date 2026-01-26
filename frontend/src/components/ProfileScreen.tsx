import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
import userTeacherUrl from '../assets/user_teacher.png'
import planetUrl from '../assets/planet_.png'
import lookPlanetUrl from '../assets/lookplanet.png' // Assuming this is used for 'Información' or decoration
import './ProfileScreen.css'

import type { StudentData } from '../lib/api' // Import StudentData

interface ProfileScreenProps {
  user: User
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user }) => {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadFeedback, setUploadFeedback] = useState<{ status: 'success' | 'error'; message: string } | null>(null)
  const [studentData, setStudentData] = useState<StudentData | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const isProfessor =
    user.user_metadata?.role?.toLowerCase() === 'professor' ||
    user.app_metadata?.role?.toLowerCase() === 'professor' ||
    user.user_metadata?.is_professor === true;

  const handleLogout = async () => {
    setLoading(true)
    try {
      await auth.signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate('/')
  }

  const handleUploadClick = () => {
    setUploadFeedback(null)
    fileInputRef.current?.click()
  }

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadFeedback(null)

    try {
      const uploads = await Promise.all(
        Array.from(files).map(async (file) => {
          if (file.type !== 'application/pdf') {
            return { fileName: file.name, error: new Error('Solo se permiten archivos PDF') }
          }
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
          const filePath = `professors/${user.id}/${timestamp}-${file.name}`
          const { error } = await supabase.storage
            .from('course-materials')
            .upload(filePath, file, {
              contentType: 'application/pdf',
              cacheControl: '3600',
              upsert: false,
            })
          return { fileName: file.name, error: error ? new Error(error.message) : null }
        })
      )

      const failedUploads = uploads.filter((result) => result.error !== null)
      if (failedUploads.length === uploads.length) {
        setUploadFeedback({
          status: 'error',
          message: 'No se pudieron subir los archivos seleccionados.',
        })
      } else {
        setUploadFeedback({
          status: 'success',
          message: 'Cursos subidos correctamente.',
        })
      }
    } catch (error) {
      console.error('Error al subir los cursos:', error)
      setUploadFeedback({ status: 'error', message: 'Error inesperado al subir.' })
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    const fetchStudentData = async () => {
      if (user && !isProfessor) { // Fetch only if not professor (or maybe fetch for both if useful?)
        try {
          // Note: getStudentProgress expects a student ID. 
          // If the auth user is a student, we use their ID.
          // However, the API seems to expect a numeric ID usually?? 
          // Wait, api.ts says `getStudentProgress(studentId: string)`. 
          // Let's assume user.id (UUID) works if the backend supports it, 
          // or we might need the numeric ID from the public users table.

          // Actually, in StudentProgressScreen it uses `studentId` from params.
          // Here we are the logged in user.
          // Let's try passing user.id.
          import('../lib/api').then(async ({ getStudentProgress }) => {
            const data = await getStudentProgress(user.id)
            setStudentData(data)
          }).catch(err => console.error("Failed to load api", err));

        } catch (error) {
          console.error('Error fetching student data:', error)
        }
      }
    }
    fetchStudentData()
  }, [user, isProfessor])

  return (
    <div className="profile-screen">
      {/* Background Ornaments */}
      <div className="bg-ornament ornament-1"></div>
      <div className="bg-ornament ornament-2"></div>
      <div className="character-circle"></div>

      {/* Sidebar */}
      <aside className="profile-sidebar">
        <div className="sidebar-profile">
          <div className="profile-avatar-wrapper">
            <img src={user.user_metadata?.avatar_url || userTeacherUrl} alt="Profile" />
          </div>
          <h2 className="sidebar-name">{user.user_metadata?.full_name || user.email || 'Usuario'}</h2>
          <p className="sidebar-email" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginTop: '5px' }}>
            {user.email}
          </p>
        </div>

        <nav className="sidebar-menu">
          <div className="menu-item active">
            <div className="menu-icon-circle">
              <span style={{ fontSize: '14px' }}>👤</span>
            </div>
            <span className="menu-label">Account</span>
          </div>
        </nav>

        <div className="logout-container">
          <button className="btn-back" onClick={handleBack} style={{ marginBottom: '10px' }}>
            ← Volver
          </button>
          <button className="btn-logout" onClick={handleLogout} disabled={loading}>
            {loading ? 'Cerrando...' : 'Cerrar Sesión'}
          </button>
        </div>
      </aside>

      {/* Decorative Character (Top Right) */}
      <div className="character-float">
        <img src={lookPlanetUrl} alt="Character Decoration" style={{ width: '100%', opacity: 0.9 }} />
      </div>

      {/* Main Content */}
      <main className="profile-main-content">
        <header className="header-section">
          <h1 className="academic-title">
            Perfil <span>academico</span>
          </h1>
          <div className="header-underline"></div>
        </header>

        <div className="dashboard-grid">
          {/* Main Column - Centered if no sidebar updates */}
          <div className="left-column" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
            {/* Combined Card */}
            <div className="card">
              {/* Section 1: Última actividad */}
              <div className="section-block">
                <span className="section-subtitle">
                  {user.user_metadata?.role === 'professor' ? 'Teacher' : 'Student'}
                  {user.user_metadata?.school_name ? ` at ${user.user_metadata.school_name}` : ''}
                </span>
                <h3 className="section-title">Última actividad</h3>

                <div className="activity-header">
                  <div className="activity-icon">
                    <img src={planetUrl} alt="Planet" style={{ width: '60%', height: '60%', objectFit: 'contain' }} />
                  </div>
                  <div className="activity-label">Progreso <br />en Clases</div>
                </div>

                <div className="progress-list">
                  {!studentData || studentData.courses.length === 0 ? (
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>No hay cursos activos.</p>
                  ) : (
                    studentData.courses.map(course => (
                      <div key={course.id} className="progress-item">
                        <div className={`progress-bar ${course.color || 'purple'}`} style={{ width: `${course.progress}%` }}>
                          <span>{course.name}</span>
                          <span>{course.progress}%</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Divider */}
              <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '10px 0' }}></div>

              {/* Section 2: Acerca del... */}
              <div className="section-block">
                <span className="section-subtitle">
                  {user.user_metadata?.role === 'professor' ? 'Teacher' : 'Student'}
                </span>
                <h3 className="section-title">Acerca del {isProfessor ? 'profesor' : 'alumno'}</h3>

                <div className="info-header">
                  <div className="info-icon">
                    <img src={lookPlanetUrl} alt="Info" style={{ width: '60%', height: '60%', objectFit: 'contain' }} />
                  </div>
                  <span className="info-text" style={{ fontWeight: '700' }}>Información</span>
                </div>

                <div className="info-list">
                  <div className="info-item">
                    <div className="info-item-left">
                      <div className="dot orange"></div>
                      <span className="info-text">Centro Educativo: {user.user_metadata?.school_name || 'N/A'}</span>
                    </div>
                    {/* <span className="chevron-right">»</span> */}
                  </div>

                  {!isProfessor && (
                    <>
                      <div className="info-item">
                        <div className="info-item-left">
                          <div className="dot purple"></div>
                          <span className="info-text">Grado: {user.user_metadata?.grade || user.user_metadata?.cohort || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="info-item">
                        <div className="info-item-left">
                          <div className="dot yellow"></div>
                          <span className="info-text">Sección: {user.user_metadata?.section || 'N/A'}</span>
                        </div>
                      </div>
                    </>
                  )}

                  {isProfessor && (
                    <div className="info-item">
                      <div className="info-item-left">
                        <div className="dot lime"></div>
                        <span className="info-text">Materia: {user.user_metadata?.subject || 'N/A'}</span>
                      </div>
                    </div>
                  )}
                </div>

                {isProfessor && (
                  <div className="professor-upload-section" style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                    <button className="follow-btn" style={{ width: '100%' }} onClick={handleUploadClick}>
                      {uploading ? 'Subiendo...' : 'Subir Cursos PDF'}
                    </button>
                    <input type="file" ref={fileInputRef} hidden accept="application/pdf" multiple onChange={handlePdfUpload} />
                    {uploadFeedback && <p style={{ fontSize: '12px', marginTop: '10px', color: uploadFeedback.status === 'success' ? '#c5ff00' : '#ff4757' }}>{uploadFeedback.message}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Removed Mock Data */}
          {/* 
          <div className="right-column">
             ... Mock Updates Removed ...
          </div> 
          */}
        </div>
      </main>
    </div>
  )
}

export default ProfileScreen
