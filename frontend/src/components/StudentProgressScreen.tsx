import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { auth } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
import { getStudentProgress, type StudentData } from '../lib/api'
import './StudentProgressScreen.css'

// Assets - trying to guess existing ones based on directory listing
import lookplanetUrl from '../assets/lookplanet.png'
import playUrl from '../assets/play.png'
import planetUrl from '../assets/planet_.png'

// Fallback user avatar if none provided
const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=random'

interface StudentProgressScreenProps {
    user: User
}

const StudentProgressScreen: React.FC<StudentProgressScreenProps> = ({ user }) => {
    const [dataLoading, setDataLoading] = useState(true)
    const [studentData, setStudentData] = useState<StudentData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()
    const { studentId } = useParams()
    const location = useLocation()

    useEffect(() => {
        const fetchStudentData = async () => {
            if (!studentId) {
                setError('No student ID provided')
                setDataLoading(false)
                return
            }

            try {
                setDataLoading(true)
                setError(null)

                if (location.state?.studentData) {
                    setStudentData(location.state.studentData)
                    // If we want real data we can fetch it, but let's stick to mock or state for UI
                } else {
                    const data = await getStudentProgress(studentId)
                    setStudentData(data)
                }
            } catch (err: any) {
                console.error('Error fetching student data:', err)
                if (location.state?.studentData) {
                    setStudentData(location.state.studentData)
                } else {
                    setError('Error al cargar los datos del alumno')
                }
            } finally {
                setDataLoading(false)
            }
        }

        fetchStudentData()
    }, [studentId, location.state])

    const handleBackToStudents = () => {
        navigate('/alumnos')
    }

    if (dataLoading) {
        return <div className="sd-loading">Cargando...</div>
    }

    if (error && !studentData) {
        return (
            <div className="sd-error">
                <p>Error: {error}</p>
                <button onClick={handleBackToStudents}>Volver</button>
            </div>
        )
    }

    if (!studentData) return null

    return (
        <div className="sd-container">
            {/* Top Right Decoration */}
            <div className="sd-decoration-top-right">
                <div className="sd-purple-blob"></div>
                <img src={lookplanetUrl} alt="Boy looking at planet" className="sd-illustration" onError={(e) => e.currentTarget.style.display = 'none'} />
            </div>

            {/* Left Sidebar */}
            <aside className="sd-sidebar">
                <button className="sd-back-button" onClick={handleBackToStudents}>
                    ← Volver
                </button>
                <div className="sd-profile-pic">
                    <img src={studentData.avatar || defaultAvatar} alt={studentData.name} />
                </div>
                <h2 className="sd-profile-name">{studentData.name}</h2>
                <div className="sd-account-btn">
                    <div className="sd-account-icon">
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>
                    <span>Account</span>
                    <div className="sd-account-indicator"></div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="sd-main">
                <div className="sd-header-row">
                    <div className="sd-title-section">
                        <h1>
                            <span className="sd-title-light">Perfil</span><br />
                            <span className="sd-title-bold">academico</span>
                        </h1>
                        <div className="sd-title-underline"></div>
                    </div>

                    <div className="sd-latest-updates">
                        <h2>Latest<br />Updates</h2>
                        <div className="sd-avatars-row">
                            <div className="sd-avatar-circle" style={{ backgroundColor: '#9d50bb' }}>
                                <img src={defaultAvatar} alt="user1" />
                            </div>
                            <div className="sd-avatar-circle" style={{ backgroundColor: '#ff9f43' }}>
                                <img src={defaultAvatar} alt="user2" />
                            </div>
                            <div className="sd-avatar-circle" style={{ backgroundColor: '#4a90e2' }}>
                                <img src={defaultAvatar} alt="user3" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="sd-grid">
                    {/* Left Column Cards */}
                    <div className="sd-col-left">
                        {/* Ultima Actividad Card */}
                        <div className="sd-card sd-activity-card">
                            <h3 className="sd-card-title">Última actividad</h3>
                            <p className="sd-card-subtitle">Teacher at Lorem School <span className="sd-time">1 hour ago</span></p>

                            <div className="sd-activity-header">
                                <div className="sd-globe-icon">
                                    <img src={planetUrl} alt="Globe" onError={(e) => e.currentTarget.style.display = 'none'} />
                                </div>
                                <div className="sd-activity-text">
                                    <h4>Progreso<br />en clases</h4>
                                </div>
                            </div>

                            <div className="sd-progress-bars">
                                <div className="sd-progress-item">
                                    <div className="sd-progress-track">
                                        <div className="sd-progress-fill sd-color-purple" style={{ width: '30%' }}>
                                            <span className="sd-progress-label">Startech</span>
                                            <span className="sd-progress-value">30%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="sd-progress-item">
                                    <div className="sd-progress-track">
                                        <div className="sd-progress-fill sd-color-orange" style={{ width: '50%' }}>
                                            <span className="sd-progress-label">STEAM</span>
                                            <span className="sd-progress-value">50%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="sd-progress-item">
                                    <div className="sd-progress-track">
                                        <div className="sd-progress-fill sd-color-lime" style={{ width: '20%' }}>
                                            <span className="sd-progress-label">Inglés</span>
                                            <span className="sd-progress-value">20%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Acerca del alumno Card */}
                        <div className="sd-card sd-about-card">
                            <h3 className="sd-card-title">Acerca del<br />alumno</h3>
                            <p className="sd-card-subtitle">Teacher at Lorem School</p>

                            <div className="sd-about-header">
                                <div className="sd-globe-icon-small">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                                    </svg>
                                </div>
                                <h4>Información</h4>
                            </div>

                            <ul className="sd-info-list">
                                <li>
                                    <div className="sd-info-label">
                                        <span className="sd-dot sd-dot-orange"></span>
                                        Centro Educativo
                                    </div>
                                    <span className="sd-chevron">›</span>
                                </li>
                                <li>
                                    <div className="sd-info-label">
                                        <span className="sd-dot sd-dot-purple"></span>
                                        Grado
                                    </div>
                                    <span className="sd-chevron">›</span>
                                </li>
                                <li>
                                    <div className="sd-info-label">
                                        <span className="sd-dot sd-dot-lime"></span>
                                        Sección
                                    </div>
                                    <span className="sd-chevron">›</span>
                                </li>
                                <li>
                                    <div className="sd-info-label">
                                        <span className="sd-dot sd-dot-blue"></span>
                                        Materia
                                    </div>
                                    <span className="sd-chevron">›</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Column Card */}
                    <div className="sd-col-right">
                        <div className="sd-card sd-comments-card">
                            <div className="sd-comments-header">
                                <div>
                                    <h3 className="sd-card-title">Más<br />comentarios</h3>
                                    <p className="sd-card-subtitle sd-followers">5620 followers</p>
                                </div>
                                <button className="sd-follow-btn">Follow</button>
                            </div>

                            <div className="sd-comments-content">
                                <div className="sd-comment-feed">
                                    <div className="sd-comment-item">
                                        <div className="sd-comment-avatar">
                                            <img src={defaultAvatar} alt="Andy Brown" />
                                        </div>
                                        <div className="sd-comment-body">
                                            <div className="sd-comment-author-row">
                                                <div className="sd-author-info">
                                                    <h4>Andy Brown</h4>
                                                    <span className="sd-author-role">Teacher at Ipsum School</span>
                                                    <span className="sd-comment-time">3 hours ago</span>
                                                </div>
                                                <div className="sd-info-icon">
                                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <circle cx="12" cy="12" r="10"></circle>
                                                        <line x1="12" y1="16" x2="12" y2="12"></line>
                                                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                                    </svg>
                                                </div>
                                            </div>
                                            <p className="sd-comment-text">
                                                Sonet putent cum ad, ei eam alia illum sententiae, ex utroque tractatos pro. Vim appareat similique.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="sd-comment-input-area">
                                        <div className="sd-comment-avatar">
                                            <img src={defaultAvatar} alt="Current User" />
                                        </div>
                                        <div className="sd-input-wrapper">
                                            <input type="text" placeholder="Share lesson..." />
                                            <div className="sd-attachment-icon">
                                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="sd-video-player">
                                    <div className="sd-video-bg">
                                        {/* Fallback to planet image if video bg not available */}
                                        <img src={planetUrl} alt="Video Thumbnail" className="sd-video-thumbnail" onError={(e) => e.currentTarget.style.display = 'none'} />
                                    </div>
                                    <div className="sd-play-button">
                                        <img src={playUrl} alt="Play" onError={(e) => e.currentTarget.style.display = 'none'} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default StudentProgressScreen

