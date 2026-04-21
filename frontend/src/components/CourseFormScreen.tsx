import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { User } from '@supabase/supabase-js'
import TopNavigation from './TopNavigation'
import { getUserRole } from '../utils/getUserRole'
import { auth } from '../lib/supabase'
import {
    getSectionById,
    createSection,
    updateSection,
    getGradeContent,
    type Section,
    type GradeContent
} from '../lib/adminApi'
import './HierarchyConfig.css' // Reusing styles

interface CourseFormScreenProps {
    user: User
}

const CourseFormScreen: React.FC<CourseFormScreenProps> = ({ user }) => {
    const { centerId, gradeId, courseId } = useParams<{ centerId: string, gradeId: string, courseId?: string }>()
    const navigate = useNavigate()
    const userRole = getUserRole(user)

    const [loading, setLoading] = useState(false)
    const [pageLoading, setPageLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Form State
    const [formData, setFormData] = useState<Partial<Section>>({
        name: '',
        short_name: '',
        description: '',
        start_date: '',
        end_date: '',
        course_id: '',
        visibility: 'active',
        max_students: 30
    })

    const isEditing = !!courseId && courseId !== 'new'

    useEffect(() => {
        const loadData = async () => {
            if (isEditing && courseId) {
                try {
                    setPageLoading(true)
                    const section = await getSectionById(courseId)
                    setFormData({
                        name: section.name || '',
                        short_name: section.short_name || '',
                        description: section.description || '',
                        start_date: section.start_date ? section.start_date.split('T')[0] : '',
                        end_date: section.end_date ? section.end_date.split('T')[0] : '',
                        course_id: section.course_id || '',
                        visibility: section.visibility || 'active',
                        max_students: section.max_students || 30
                    })
                } catch (err: any) {
                    setError('Error al cargar datos del curso')
                    console.error(err)
                } finally {
                    setPageLoading(false)
                }
            } else {
                setPageLoading(false)
            }
        }
        loadData()
    }, [courseId, isEditing])

    const handleNavigate = (path: string) => {
        navigate(path)
    }

    const handleLogout = async () => {
        await auth.signOut()
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async () => {
        if (!centerId || !gradeId) {
            setError('Faltan parámetros de URL')
            return
        }

        try {
            setLoading(true)
            setError(null)

            const cleanData = {
                ...formData,
                visibility: formData.visibility as 'active' | 'hidden' | 'archived',
                max_students: Number(formData.max_students)
            }

            if (isEditing && courseId) {
                await updateSection(courseId, cleanData)
            } else {
                await createSection({ ...cleanData, grade_id: gradeId } as any)
            }

            // Navigate back to school detail
            navigate(`/admin/school/${centerId}`)
        } catch (err: any) {
            setError(err.message || 'Error al guardar el curso')
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        navigate(`/admin/school/${centerId}`)
    }

    if (pageLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p>Cargando curso...</p>
            </div>
        )
    }

    return (
        <>
            <TopNavigation
                activeKey="schools"
                userDisplayName={user.user_metadata?.first_name || user.email || 'Usuario'}
                userRole={userRole}
                onNavigate={handleNavigate}
                onLogout={handleLogout}
            />

            <div className="hierarchy-config" style={{ marginTop: '0px', padding: '2rem 4rem' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>

                    {/* Header */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto 1fr',
                        alignItems: 'center',
                        marginBottom: '3rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                            <button
                                className="btn-back"
                                onClick={handleCancel}
                                style={{ position: 'static' }}
                            >
                                ← Volver
                            </button>
                        </div>
                        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>
                            {isEditing ? 'Editar Curso' : 'Nuevo Curso'}
                        </h1>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            {/* Placeholder for balance or actions */}
                        </div>
                    </div>

                    {error && (
                        <div className="error-banner" style={{ marginBottom: '2rem' }}>
                            <span>❌ {error}</span>
                            <button onClick={() => setError(null)}>✕</button>
                        </div>
                    )}

                    <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        padding: '3rem',
                        borderRadius: '30px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        width: '100%',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
                            {/* Basic Info */}
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '1.1rem', marginBottom: '0.8rem', color: '#e879f9' }}>Nombre Completo del Curso *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="modern-input"
                                    style={{ padding: '1rem', fontSize: '1.1rem', background: 'rgba(0,0,0,0.2)' }}
                                    placeholder="Ej: Matemáticas Avanzadas I"
                                    autoFocus={!isEditing}
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Nombre Corto</label>
                                <input
                                    type="text"
                                    name="short_name"
                                    value={formData.short_name}
                                    onChange={handleChange}
                                    className="modern-input"
                                    style={{ padding: '1rem' }}
                                    placeholder="Ej: MAT-101"
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>ID del Curso (Opcional)</label>
                                <input
                                    type="text"
                                    name="course_id"
                                    value={formData.course_id}
                                    onChange={handleChange}
                                    className="modern-input"
                                    style={{ padding: '1rem' }}
                                    placeholder="Identificador único"
                                />
                            </div>

                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Descripción</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="modern-input"
                                    style={{ minHeight: '150px', resize: 'vertical', padding: '1rem', lineHeight: '1.6' }}
                                    placeholder="Descripción general del curso..."
                                />
                            </div>

                            {/* Dates */}
                            <div className="form-group">
                                <label style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Fecha de Inicio</label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    className="modern-input"
                                    style={{ padding: '1rem' }}
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Fecha de Finalización</label>
                                <input
                                    type="date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleChange}
                                    className="modern-input"
                                    style={{ padding: '1rem' }}
                                />
                            </div>

                            {/* Settings */}
                            <div className="form-group">
                                <label style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Visibilidad</label>
                                <select
                                    name="visibility"
                                    value={formData.visibility}
                                    onChange={handleChange}
                                    className="modern-input"
                                    style={{ padding: '1rem' }}
                                >
                                    <option value="active">Mostrar</option>
                                    <option value="hidden">Ocultar</option>
                                    <option value="archived">Archivado</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Cantidad de Estudiantes</label>
                                <input
                                    type="number"
                                    name="max_students"
                                    value={formData.max_students}
                                    onChange={handleChange}
                                    className="modern-input"
                                    style={{ padding: '1rem' }}
                                    min="1"
                                />
                            </div>
                        </div>

                        <div className="modal-actions" style={{ marginTop: '3rem', maxWidth: '400px', marginLeft: 'auto' }}>
                            <button
                                className="btn-cancel-modern"
                                onClick={handleCancel}
                                style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn-save-modern"
                                onClick={handleSubmit}
                                disabled={loading || !formData.name}
                                style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
                            >
                                {loading ? 'Guardando...' : 'Guardar Curso'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CourseFormScreen
