import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
import astronautUrl from '../assets/astronauta.png'
import './ProfileScreen.css'

interface ProfileScreenProps {
  user: User
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user }) => {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadFeedback, setUploadFeedback] = useState<{ status: 'success' | 'error'; message: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

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

  const isProfessor =
    user.user_metadata?.role?.toLowerCase() === 'professor' ||
    user.app_metadata?.role?.toLowerCase() === 'professor' ||
    user.user_metadata?.is_professor === true;

  return (
    <div className="profile-screen">
      {/* Background Ornaments */}
      <div className="bg-ornament ornament-1"></div>
      <div className="bg-ornament ornament-2"></div>
      <div className="character-circle"></div>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-profile">
          <div className="profile-avatar-wrapper">
            <img src={user.user_metadata?.avatar_url || astronautUrl} alt="Profile" />
          </div>
          <h2 className="sidebar-name">{user.user_metadata?.full_name || 'Raquel López'}</h2>
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
          <button className="btn-logout" onClick={handleLogout} disabled={loading}>
            {loading ? 'Cerrando...' : 'Cerrar Sesión'}
          </button>
        </div>
      </aside>

      {/* Decorative Character (Top Right) */}
      <div className="character-float">
        <img src={astronautUrl} alt="Character Decoration" style={{ width: '100%', opacity: 0.9 }} />
      </div>

      {/* Main Content */}
      <main className="main-content">
        <header className="header-section">
          <h1 className="academic-title">
            Perfil <span>academico</span>
          </h1>
          <div className="header-underline"></div>
        </header>

        <div className="dashboard-grid">
          {/* Left Column */}
          <div className="left-column" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* Última actividad Card */}
            <div className="card">
              <span className="section-subtitle">Teacher at Lorem School • 1 hour ago</span>
              <h3 className="section-title">Última actividad</h3>

              <div className="activity-header">
                <div className="activity-icon">
                  <span style={{ fontSize: '24px' }}>🌍</span>
                </div>
                <div className="activity-label">Progreso <br />en Clases</div>
              </div>

              <div className="progress-list">
                <div className="progress-item">
                  <div className="progress-bar purple" style={{ width: '30%' }}>
                    <span>Spain</span>
                    <span>30%</span>
                  </div>
                </div>
                <div className="progress-item">
                  <div className="progress-bar orange" style={{ width: '50%' }}>
                    <span>Italy</span>
                    <span>50%</span>
                  </div>
                </div>
                <div className="progress-item">
                  <div className="progress-bar lime" style={{ width: '20%' }}>
                    <span>France</span>
                    <span>20%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Acerca del alumno Card */}
            <div className="card">
              <span className="section-subtitle">Teacher at Lorem School</span>
              <h3 className="section-title">Acerca del alumno</h3>

              <div className="info-header">
                <div className="info-icon">
                  <span style={{ fontSize: '20px' }}>🇦🇺</span>
                </div>
                <span className="info-text" style={{ fontWeight: '700' }}>Información</span>
              </div>

              <div className="info-list">
                <div className="info-item">
                  <div className="info-item-left">
                    <div className="dot orange"></div>
                    <span className="info-text">Centro Educativo</span>
                  </div>
                  <span className="chevron-right">»</span>
                </div>
                <div className="info-item">
                  <div className="info-item-left">
                    <div className="dot purple"></div>
                    <span className="info-text">Grado</span>
                  </div>
                  <span className="chevron-right">»</span>
                </div>
                <div className="info-item">
                  <div className="info-item-left">
                    <div className="dot yellow"></div>
                    <span className="info-text">Sección</span>
                  </div>
                  <span className="chevron-right">»</span>
                </div>
                <div className="info-item">
                  <div className="info-item-left">
                    <div className="dot lime"></div>
                    <span className="info-text">Materia</span>
                  </div>
                  <span className="chevron-right">»</span>
                </div>
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

          {/* Right Column */}
          <div className="right-column">
            <div className="updates-section">
              <div className="updates-header">
                <h2 className="updates-title">Latest Updates</h2>
                <div className="mini-avatars">
                  <div className="mini-avatar"><img src={astronautUrl} alt="u1" /></div>
                  <div className="mini-avatar" style={{ background: '#4a90e2' }}></div>
                  <div className="mini-avatar" style={{ background: '#f5a623' }}></div>
                </div>
              </div>

              <div className="card comments-card">
                <div className="card-top-header">
                  <h3 className="section-title">Más comentarios</h3>
                  <button className="follow-btn">Follow</button>
                </div>
                <span className="section-subtitle" style={{ marginTop: '-15px', display: 'block' }}>5620 followers</span>

                <div className="post-content" style={{ marginTop: '20px' }}>
                  <div className="post-user-avatar" style={{ background: '#3c09b2' }}>
                    <img src={astronautUrl} alt="Andy Brown" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className="post-details">
                    <div className="post-user-name">Andy Brown</div>
                    <div className="post-meta">Teacher at Ipsum School • 3 hours ago</div>
                    <p className="post-text">
                      Sonet putent cum ad, ei eam alia illum sententiae, ex utroque tractatos pro. Vim appeareat similique.
                    </p>

                    <div className="post-media">
                      <div className="play-icon">▶</div>
                    </div>
                  </div>
                </div>

                <div className="share-input-wrapper">
                  <div className="post-user-avatar" style={{ width: '30px', height: '30px', borderRadius: '50%' }}>
                    <img src={user.user_metadata?.avatar_url || astronautUrl} alt="me" />
                  </div>
                  <input type="text" className="share-input" placeholder="Share lesson..." />
                  <span className="paperclip-icon">🖇️</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProfileScreen
