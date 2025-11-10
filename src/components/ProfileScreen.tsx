import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
// import Logo from './Logo' // Commented out due to missing module or type declarations
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

  const roleCandidates = [
    ...(Array.isArray(user.app_metadata?.roles) ? user.app_metadata.roles : []),
    ...(Array.isArray(user.user_metadata?.roles) ? user.user_metadata.roles : []),
  ]

  const primaryRole =
    (typeof user.app_metadata?.role === 'string' && user.app_metadata.role) ||
    (typeof user.user_metadata?.role === 'string' && user.user_metadata.role) ||
    undefined

  const normalizedRoles = roleCandidates
    .filter((role) => role !== null && role !== undefined)
    .map((role) => String(role).toLowerCase().trim())

  const normalizedPrimaryRole = primaryRole?.toLowerCase().trim()

  const metadataRole = (() => {
    const roleFromUserMetadata = typeof user.user_metadata?.role === 'string' ? user.user_metadata.role : undefined
    const roleFromAppMetadata = typeof user.app_metadata?.role === 'string' ? user.app_metadata.role : undefined
    return (
      roleFromUserMetadata?.toLowerCase().trim() ||
      roleFromAppMetadata?.toLowerCase().trim()
    )
  })()

  const professorAliases = ['professor', 'teacher', 'profesor', 'docente']

  const isProfessor =
    normalizedRoles.some((role) => professorAliases.includes(role)) ||
    (normalizedPrimaryRole ? professorAliases.includes(normalizedPrimaryRole) : false) ||
    (metadataRole ? professorAliases.includes(metadataRole) : false) ||
    user.user_metadata?.is_professor === true

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

  const handleReturn = () => {
    navigate('/login')
  }

  const handleUploadClick = () => {
    setUploadFeedback(null)
    fileInputRef.current?.click()
  }

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files

    if (!files || files.length === 0) {
      return
    }

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
          message:
            failedUploads.length === 1
              ? `No se pudo subir el archivo ${failedUploads[0]?.fileName}. ${failedUploads[0]?.error?.message ?? ''}`
              : 'No se pudieron subir los archivos seleccionados. Intenta nuevamente o revisa su formato.',
        })
      } else if (failedUploads.length > 0) {
        setUploadFeedback({
          status: 'error',
          message: `Algunos archivos no se subieron correctamente (${failedUploads
            .map((file) => file.fileName)
            .join(', ')}). Revisa que sean PDF válidos o intenta de nuevo.`,
        })
      } else {
        setUploadFeedback({
          status: 'success',
          message:
            uploads.length === 1
              ? 'El curso en PDF se subió correctamente.'
              : 'Todos los cursos en PDF se subieron correctamente.',
        })
      }
    } catch (error) {
      console.error('Error al subir los cursos:', error)
      setUploadFeedback({
        status: 'error',
        message: 'Ocurrió un error inesperado al subir los cursos. Intenta nuevamente.',
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="profile-screen">
      <div className="container">
        <div className="profile-content">
          {/* <Logo size="medium" /> */}
          
          <div className="profile-section">
            <div className="avatar-container">
              <div className="avatar avatar-with-image">
                <img 
                  src={astronautUrl} 
                  alt="Astronauta" 
                  className="astronaut-image-profile"
                />
              </div>
            </div>

            <div className="user-info">
              <h2 className="user-name">
                {user.user_metadata?.full_name || 'Usuario'}
              </h2>
              <p className="user-email">{user.email}</p>
            </div>

            <div className="profile-actions">
              {isProfessor && (
                <div className="professor-tools">
                  <p className="tools-description">
                    Sube aquí tus cursos en formato PDF para ponerlos a disposición de tus estudiantes.
                  </p>
                  <button
                    className="btn btn-upload"
                    type="button"
                    onClick={handleUploadClick}
                    disabled={uploading}
                  >
                    {uploading ? 'Subiendo cursos...' : 'Subir cursos en PDF'}
                  </button>
                  <input
                    type="file"
                    accept="application/pdf"
                    multiple
                    ref={fileInputRef}
                    className="file-input-hidden"
                    onChange={handlePdfUpload}
                  />
                  {uploadFeedback && (
                    <p
                      className={`upload-feedback ${
                        uploadFeedback.status === 'success' ? 'upload-success' : 'upload-error'
                      }`}
                    >
                      {uploadFeedback.message}
                    </p>
                  )}
                </div>
              )}
              <button
                className="btn btn-primary"
                onClick={handleLogout}
                disabled={loading}
              >
                {loading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
              </button>
            </div>
          </div>

          <div className="return-button">
            <button className="btn btn-icon btn-secondary" onClick={handleReturn}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M8 12L20 8L12 12L20 16L8 12Z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <span>regresar</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileScreen
