import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    getCenters,
    createCenter,
    updateCenter,
    deleteCenter,
    getGradesByCenter,
    createGrade,
    updateGrade,
    deleteGrade,
    getSectionsByGrade,
    createSection,
    updateSection,
    deleteSection,
    getSubjectsBySection,
    createSubject,
    updateSubject,
    deleteSubject,
    type EducationalCenter,
    type GradeLevel,
    type Section,
    type Subject,
} from '../lib/adminApi'
import { User } from '@supabase/supabase-js'
import TopNavigation from './TopNavigation'
import { getUserRole } from '../utils/getUserRole'
import { auth } from '../lib/supabase'
import './HierarchyConfig.css'

interface HierarchyConfigProps {
    user: User
}

const HierarchyConfig: React.FC<HierarchyConfigProps> = ({ user }) => {
    const navigate = useNavigate()
    const userRole = getUserRole(user)

    const handleNavigate = (path: string) => {
        navigate(path)
    }

    const handleLogout = async () => {
        await auth.signOut()
    }

    // State for data
    const [centers, setCenters] = useState<EducationalCenter[]>([])
    const [selectedCenter, setSelectedCenter] = useState<EducationalCenter | null>(null)

    // State for loading and errors
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // State for modals
    const [showCenterModal, setShowCenterModal] = useState(false)
    // State for forms
    const [centerForm, setCenterForm] = useState({ name: '', address: '', phone: '', email: '' })
    const [gradeForm, setGradeForm] = useState({ name: '', level: 0 })
    const [sectionForm, setSectionForm] = useState({ name: '', max_students: 30 })
    const [subjectForm, setSubjectForm] = useState({ name: '', description: '', hours_per_week: 0 })

    // State for editing
    const [editingCenter, setEditingCenter] = useState<EducationalCenter | null>(null)

    // Load centers on mount
    useEffect(() => {
        loadCenters()
    }, [])

    const loadCenters = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await getCenters()
            setCenters(data)
        } catch (err: any) {
            setError(err.message || 'Error al cargar centros educativos')
        } finally {
            setLoading(false)
        }
    }

    const loadGrades = async (centerId: string) => {
        try {
            setLoading(true)
            const data = await getGradesByCenter(centerId)
            setGrades(data)
        } catch (err: any) {
            setError(err.message || 'Error al cargar grados')
        } finally {
            setLoading(false)
        }
    }

    const loadSections = async (gradeId: string) => {
        try {
            setLoading(true)
            const data = await getSectionsByGrade(gradeId)
            setSections(data)
        } catch (err: any) {
            setError(err.message || 'Error al cargar secciones')
        } finally {
            setLoading(false)
        }
    }

    const loadSubjects = async (sectionId: string) => {
        try {
            setLoading(true)
            const data = await getSubjectsBySection(sectionId)
            setSubjects(data)
        } catch (err: any) {
            setError(err.message || 'Error al cargar materias')
        } finally {
            setLoading(false)
        }
    }

    // ========== CENTER FUNCTIONS ==========

    const handleCreateCenter = () => {
        setCenterForm({ name: '', address: '', phone: '', email: '' })
        setEditingCenter(null)
        setShowCenterModal(true)
    }

    const handleEditCenter = (center: EducationalCenter) => {
        setCenterForm({
            name: center.name,
            address: center.address || '',
            phone: center.phone || '',
            email: center.email || '',
        })
        setEditingCenter(center)
        setShowCenterModal(true)
    }

    const handleSaveCenter = async () => {
        try {
            setLoading(true)
            if (editingCenter) {
                await updateCenter(editingCenter.id, centerForm)
            } else {
                await createCenter(centerForm)
            }
            await loadCenters()
            setShowCenterModal(false)
        } catch (err: any) {
            setError(err.message || 'Error al guardar centro')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteCenter = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este centro? Se eliminarán todos los grados, secciones y materias asociadas.')) return

        try {
            setLoading(true)
            await deleteCenter(id)
            await loadCenters()
            if (selectedCenter?.id === id) {
                setSelectedCenter(null)
            }
        } catch (err: any) {
            setError(err.message || 'Error al eliminar centro')
        } finally {
            setLoading(false)
        }
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
            <div className="hierarchy-config" style={{ marginTop: '0px' }}>
                <div className="hierarchy-header" style={{ marginTop: '40px' }}>
                    <h1>Escuelas</h1>
                </div>

                {loading && !centers.length ? (
                    <div className="loading-container">
                        <p>Cargando escuelas...</p>
                    </div>
                ) : (
                    <div className="schools-grid">
                        {centers.map((center) => (
                            <div key={center.id} className="school-card" onClick={() => navigate(`/admin/school/${center.id}`)}>
                                <div className="school-icon-circle">
                                    {center.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="school-info">
                                    <h3>{center.name}</h3>
                                    <p className="school-description">
                                        {center.address || 'Sin dirección'}
                                    </p>
                                    <div className="school-rating">
                                        <span className="star">★</span>
                                        <span className="star">★</span>
                                        <span className="star">★</span>
                                        <span className="star">★</span>
                                        <span className="star">★</span>
                                    </div>
                                </div>
                                <div className="item-actions">
                                    <button
                                        className="btn-icon"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleEditCenter(center)
                                        }}
                                        title="Editar"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="btn-icon"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteCenter(center.id)
                                        }}
                                        title="Eliminar"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="hierarchy-footer">
                    <button className="btn-add-center" onClick={handleCreateCenter}>
                        Agregar centro
                    </button>
                </div>

                {/* Styled Type Form Modal */}
                {showCenterModal && (
                    <div className="modal-overlay" onClick={() => setShowCenterModal(false)}>
                        <div className="school-modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <div className="modal-icon">
                                    {editingCenter ? '✏️' : '🏫'}
                                </div>
                                <h2>{editingCenter ? 'Editar Centro' : 'Nuevo Centro'}</h2>
                                <p>Ingresa los datos del centro educativo a continuación.</p>
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Nombre *</label>
                                    <input
                                        type="text"
                                        value={centerForm.name}
                                        onChange={(e) => setCenterForm({ ...centerForm, name: e.target.value })}
                                        placeholder="Ej: Colegio IPDC"
                                        className="modern-input"
                                        autoFocus
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Dirección</label>
                                    <input
                                        type="text"
                                        value={centerForm.address}
                                        onChange={(e) => setCenterForm({ ...centerForm, address: e.target.value })}
                                        placeholder="Ej: Av. Principal 123"
                                        className="modern-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Teléfono</label>
                                    <input
                                        type="text"
                                        value={centerForm.phone}
                                        onChange={(e) => setCenterForm({ ...centerForm, phone: e.target.value })}
                                        placeholder="Ej: 555-1234"
                                        className="modern-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={centerForm.email}
                                        onChange={(e) => setCenterForm({ ...centerForm, email: e.target.value })}
                                        placeholder="Ej: contacto@colegio.com"
                                        className="modern-input"
                                    />
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button className="btn-cancel-modern" onClick={() => setShowCenterModal(false)}>
                                    Cancelar
                                </button>
                                <button
                                    className="btn-save-modern"
                                    onClick={handleSaveCenter}
                                    disabled={!centerForm.name || loading}
                                >
                                    {loading ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default HierarchyConfig
