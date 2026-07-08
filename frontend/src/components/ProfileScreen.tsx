import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
import userTeacherUrl from '../assets/user_teacher.png'
import './ProfileScreen.css'

import type { StudentData } from '../lib/api' // Import StudentData

import { getUserRole } from '../utils/getUserRole' // Ensure this import exists or add it

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

  const userRole = getUserRole(user)
  const isProfessor = userRole === 'professor' || userRole === 'admin' 

  const getRoleDisplay = () => {
    const role = getUserRole(user)
    if (role === 'admin') return 'Admin'
    if (role === 'professor') return 'Profesor'
    if (role === 'tutor') return 'Tutor'
    return 'Alumno'
  }

  const [profileDetails, setProfileDetails] = useState<{ centers: string, grades: string, subjects: string } | null>(null)

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
    const fetchProfileDetails = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/users/${user.id}/profile-details?role=${userRole}`)
        if (res.ok) {
          const data = await res.json()
          setProfileDetails(data)
        }
      } catch (err) {
        console.error('Error fetching profile details:', err)
      }
    }
    fetchProfileDetails()

    const fetchStudentData = async () => {
      if (user && !isProfessor && userRole !== 'tutor' && userRole !== 'admin') { 
        try {
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
  }, [user, isProfessor, userRole])

  return (
    <div style={{ padding: '2rem 4rem', backgroundColor: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>Configuración del Perfil</h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '0.5rem' }}>Gestiona tu información y preferencias</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Left Column - User Info Card */}
        <div style={{ background: '#ffffff', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', border: '4px solid #f1f5f9', marginBottom: '1.5rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            <img src={user.user_metadata?.avatar_url || userTeacherUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{user.user_metadata?.full_name || user.email || 'Usuario'}</h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{user.email}</p>
          
          <div style={{ background: '#eff6ff', color: '#2563eb', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '1.5rem', border: '1px solid #bfdbfe' }}>
            Rol: {getRoleDisplay()}
          </div>
        </div>

        {/* Right Column - Details & Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Details Card */}
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>ℹ️</span> Información Académica
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Centros Educativos</div>
                <div style={{ fontWeight: 'bold', color: '#334155' }}>{profileDetails ? profileDetails.centers : 'Cargando...'}</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Grados</div>
                <div style={{ fontWeight: 'bold', color: '#334155' }}>{profileDetails ? profileDetails.grades : 'Cargando...'}</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #f1f5f9', gridColumn: '1 / -1' }}>
                <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Materias</div>
                <div style={{ fontWeight: 'bold', color: '#334155' }}>{profileDetails ? profileDetails.subjects : 'Cargando...'}</div>
              </div>
            </div>
          </div>

          {/* Activity / Progress Card */}
          {(!isProfessor || userRole === 'admin') && (
            <div style={{ background: '#ffffff', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>📊</span> {userRole === 'admin' ? 'Gestión Adicional' : 'Tu Progreso'}
              </h3>
              
              {userRole === 'admin' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <p style={{ color: '#64748b' }}>Sube materiales PDF para los cursos de la plataforma.</p>
                  <button 
                    style={{ background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', width: 'fit-content' }} 
                    onClick={handleUploadClick}
                  >
                    {uploading ? 'Subiendo...' : 'Subir Cursos PDF'}
                  </button>
                  <input type="file" ref={fileInputRef} hidden accept="application/pdf" multiple onChange={handlePdfUpload} />
                  {uploadFeedback && (
                    <div style={{ padding: '1rem', borderRadius: '12px', background: uploadFeedback.status === 'success' ? '#dcfce7' : '#fee2e2', color: uploadFeedback.status === 'success' ? '#166534' : '#991b1b', marginTop: '0.5rem' }}>
                      {uploadFeedback.message}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {!studentData || studentData.courses.length === 0 ? (
                    <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>No hay cursos activos para mostrar progreso.</p>
                  ) : (
                    studentData.courses.map(course => (
                      <div key={course.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: 'bold', color: '#334155' }}>{course.name}</span>
                          <span style={{ color: '#2563eb', fontWeight: 'bold' }}>{course.progress}%</span>
                        </div>
                        <div style={{ width: '100%', height: '12px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                          <div style={{ width: `${course.progress}%`, height: '100%', background: '#2563eb', borderRadius: '6px' }}></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default ProfileScreen
