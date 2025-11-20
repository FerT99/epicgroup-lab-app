import React, { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { auth } from '../lib/supabase'
import TopNavigation from './TopNavigation'
import './CoursePdfViewerScreen.css'
import type { User } from '@supabase/supabase-js'

interface CoursePdfViewerScreenProps {
  user: User
}

interface LocationState {
  pdfUrl?: string
  title?: string
}

const DEFAULT_PDF =
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'

const CoursePdfViewerScreen: React.FC<CoursePdfViewerScreenProps> = ({ user }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { courseId, resourceId } = useParams()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const { pdfUrl, title } = (location.state as LocationState) || {}
  const effectivePdfUrl = pdfUrl || DEFAULT_PDF
  const documentTitle =
    title || `Recurso ${resourceId ?? ''}`.trim() || 'Contenido del curso'

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

  const handleOpenNotifications = () => console.log('Abrir notificaciones')

  const displayName = user.user_metadata?.full_name || user.email || 'Usuario'

  const handleOpenInNewTab = () => {
    window.open(effectivePdfUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="course-pdf-viewer">
      <TopNavigation
        activeKey="progress"
        userDisplayName={displayName}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        logoutLoading={isLoggingOut}
        notificationCount={42}
        onOpenNotifications={handleOpenNotifications}
      />

      <main className="course-pdf-viewer__main">
        <header className="course-pdf-viewer__header">
          <div className="course-pdf-viewer__breadcrumbs">
            <button
              type="button"
              className="course-pdf-viewer__breadcrumb"
              onClick={() => navigate('/progress')}
            >
              Mis cursos
            </button>
            <span className="course-pdf-viewer__breadcrumb-separator">/</span>
            <button
              type="button"
              className="course-pdf-viewer__breadcrumb"
              onClick={() => navigate('/course-map')}
            >
              Mapa del curso {courseId}
            </button>
            <span className="course-pdf-viewer__breadcrumb-separator">/</span>
            <span className="course-pdf-viewer__breadcrumb current">{documentTitle}</span>
          </div>

          <div className="course-pdf-viewer__actions">
            <button
              type="button"
              className="course-pdf-viewer__action"
              onClick={() => navigate(-1)}
            >
              ← Volver
            </button>
            <button
              type="button"
              className="course-pdf-viewer__action secondary"
              onClick={handleOpenInNewTab}
            >
              Abrir en nueva pestaña
            </button>
          </div>
        </header>

        <section className="course-pdf-viewer__content">
          <iframe
            title={documentTitle}
            src={effectivePdfUrl}
            className="course-pdf-viewer__iframe"
          />
          {!pdfUrl && (
            <div className="course-pdf-viewer__hint">
              <p>
                Estás viendo un PDF de ejemplo. Para enlazar tu propio contenido, sube el archivo a
                Supabase Storage y reemplaza la URL correspondiente cuando navegues desde el mapa del
                curso.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default CoursePdfViewerScreen

