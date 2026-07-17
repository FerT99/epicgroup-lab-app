import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    getCenters,
    createCenter,
    updateCenter,
    deleteCenter,
    getHierarchy,
    type Hierarchy,
    createGrade as _createGrade,
    updateGrade as _updateGrade,
    deleteGrade as _deleteGrade,
    createSubject as _createSubject,
    updateSubject as _updateSubject,
    deleteSubject as _deleteSubject,
    type EducationalCenter,
    type GradeLevel as _GradeLevel,
    type Subject as _Subject,
} from '../lib/adminApi'
import { User } from '@supabase/supabase-js'
import { getUserRole } from '../utils/getUserRole'
import { getGradesByCenter } from '../lib/adminApi'
import StudentManagement from './StudentManagement'
import CenterContentUpload from './CenterContentUpload'
import './HierarchyConfig.css'
import './ProfessorDashboard.css' // Import for the dashboard cards styling
import { auth } from '../lib/supabase'

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
    const [_error, setError] = useState<string | null>(null)

    // State for modals
    const [showCenterModal, setShowCenterModal] = useState(false)
    // State for forms
    const [centerForm, setCenterForm] = useState({ name: '', address: '', phone: '', email: '' })
    const [_gradeForm, _setGradeForm] = useState({ name: '', level: 0 })
    const [_subjectForm, _setSubjectForm] = useState({ name: '', description: '', hours_per_week: 0 })

    // State for editing
    const [editingCenter, setEditingCenter] = useState<EducationalCenter | null>(null)

    // State for hierarchy view
    const [activeCenterId, setActiveCenterId] = useState<string>('')
    const [hierarchy, setHierarchy] = useState<Hierarchy | null>(null)

    // State for quick actions modal
    const [showActionModal, setShowActionModal] = useState(false)
    const [actionType, setActionType] = useState<'pdf' | 'student' | 'course' | null>(null)
    const [actionCenterId, setActionCenterId] = useState<string>('')
    const [actionGradeId, setActionGradeId] = useState<string>('')
    const [actionGrades, setActionGrades] = useState<_GradeLevel[]>([])
    const [loadingActionGrades, setLoadingActionGrades] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            if (!target.closest('.add-dropdown-container')) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Load centers on mount
    useEffect(() => {
        loadCenters()
    }, [])

    useEffect(() => {
        if (activeCenterId) {
            loadHierarchy(activeCenterId)
        } else {
            setHierarchy(null)
        }
    }, [activeCenterId])

    const loadHierarchy = async (id: string) => {
        try {
            setLoading(true)
            const data = await getHierarchy(id)
            setHierarchy(data)
        } catch (err: any) {
            setError(err.message || 'Error al cargar datos de la escuela')
        } finally {
            setLoading(false)
        }
    }

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

    // const _loadGrades = async (centerId: string) => {
    //     try {
    //         setLoading(true)
    //         await getGradesByCenter(centerId)
    //         // setGrades(data)
    //     } catch (err: any) {
    //         setError(err.message || 'Error al cargar grados')
    //     } finally {
    //         setLoading(false)
    //     }
    // }

    // ========== QUICK ACTIONS FUNCTIONS ==========

    const openActionModal = (type: 'pdf' | 'student' | 'course') => {
        setActionType(type)
        setActionCenterId('')
        setActionGradeId('')
        setShowActionModal(true)
    }

    const handleActionCenterChange = async (centerId: string) => {
        setActionCenterId(centerId)
        setActionGradeId('')
        if (actionType === 'course' && centerId) {
            try {
                setLoadingActionGrades(true)
                const grades = await getGradesByCenter(centerId)
                setActionGrades(grades)
            } catch (error) {
                console.error("Error loading grades", error)
            } finally {
                setLoadingActionGrades(false)
            }
        }
    }

    const handleActionNext = () => {
        if (actionType === 'course' && actionCenterId && actionGradeId) {
            navigate(`/admin/school/${actionCenterId}/grade/${actionGradeId}/course/new`)
            setShowActionModal(false)
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
            <div className="professor-dashboard-container" style={{ padding: '2rem' }}>
                <div className="prof-main-col" style={{ width: '100%' }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 className="section-title-modern" style={{ color: 'white' }}>Centros educativos</h2>
                        <div className="add-dropdown-container" style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                style={{
                                    background: '#d966ff',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                Agregar... <span style={{ fontSize: '0.8rem', marginLeft: '0.2rem' }}>▼</span>
                            </button>

                            {showDropdown && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '0.5rem',
                                    background: '#ffffff',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                    border: '1px solid rgba(0,0,0,0.05)',
                                    minWidth: '220px',
                                    zIndex: 100,
                                    overflow: 'hidden'
                                }}>
                                    <button
                                        onClick={() => { openActionModal('pdf'); setShowDropdown(false); }}
                                        style={{ width: '100%', textAlign: 'left', padding: '1rem', background: 'transparent', border: 'none', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', color: '#1f295a', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        📄 Cargar PDFs
                                    </button>
                                    <button
                                        onClick={() => { openActionModal('student'); setShowDropdown(false); }}
                                        style={{ width: '100%', textAlign: 'left', padding: '1rem', background: 'transparent', border: 'none', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', color: '#1f295a', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        👥 Registrar Alumnos
                                    </button>
                                    <button
                                        onClick={() => { openActionModal('course'); setShowDropdown(false); }}
                                        style={{ width: '100%', textAlign: 'left', padding: '1rem', background: 'transparent', border: 'none', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', color: '#1f295a', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        📚 Crear Materia
                                    </button>
                                    <button
                                        onClick={() => { handleCreateCenter(); setShowDropdown(false); }}
                                        style={{ width: '100%', textAlign: 'left', padding: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#1f295a', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        🏫 Agregar centro
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="classes-grid" style={{ marginTop: '1.5rem' }}>
                        {loading && !centers.length ? (
                            <p style={{ gridColumn: '1 / -1' }}>Cargando centros...</p>
                        ) : centers.length === 0 ? (
                            <p style={{ gridColumn: '1 / -1', color: '#64748b' }}>No tienes centros registrados actualmente.</p>
                        ) : (
                            centers.map(center => (
                                <div key={center.id} className="class-card" style={{ position: 'relative', background: 'white', color: '#d966ff' }} onClick={() => navigate(`/admin/school/${center.id}`)}>
                                    <div className="class-header">
                                        <h3 style={{ color: '#d966ff' }}>{center.name}</h3>
                                        <div style={{ opacity: 0.7 }}>🏫</div>
                                    </div>
                                    <div className="class-stats">
                                        <div className="stat-row">
                                            <span className="stat-icon">📍</span>
                                            <span>Centro Educativo</span>
                                        </div>
                                    </div>
                                    <div className="item-actions" style={{ position: 'absolute', bottom: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="btn-icon"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleEditCenter(center)
                                            }}
                                            title="Editar"
                                            style={{ background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer', color: '#d966ff' }}
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
                                            style={{ background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer', color: '#d966ff' }}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="content-section" style={{ marginTop: '3rem' }}>
                        <h2 className="section-title-modern" style={{ color: 'white' }}>Contenido</h2>
                        <div className="notif-card" style={{ justifyContent: 'center', color: '#94a3b8', border: '1px dashed #cbd5e1', background: 'transparent', boxShadow: 'none', padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ fontSize: '2.5rem', opacity: 0.5 }}>📄</div>
                            <p style={{ margin: 0, textAlign: 'center', color: 'white' }}>Aún no hay PDFs o contenido cargado en la plataforma</p>
                        </div>
                    </div>

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

                {/* Global Action Modal */}
                {showActionModal && (
                    <div className="modal-overlay" onClick={() => setShowActionModal(false)}>
                        <div className="school-modal-content" style={{ 
                            maxWidth: actionType === 'student' ? '900px' : '600px', 
                            width: '95%',
                            background: ['student', 'course'].includes(actionType as string) ? '#ffffff' : undefined
                        }} onClick={(e) => e.stopPropagation()}>

                            {actionType === 'pdf' && (
                                <>
                                    {!actionCenterId ? (
                                        <div style={{ padding: '1rem' }}>
                                            <div className="modal-header">
                                                <div className="modal-icon">📄</div>
                                                <h2>Seleccionar Centro</h2>
                                                <p>Elige a qué centro deseas asignar los PDFs.</p>
                                            </div>
                                            <div className="form-group">
                                                <label>Centro Educativo</label>
                                                <select
                                                    value={actionCenterId}
                                                    onChange={(e) => setActionCenterId(e.target.value)}
                                                    className="modern-input"
                                                >
                                                    <option value="">Seleccione un centro...</option>
                                                    {centers.map(c => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="modal-actions" style={{ marginTop: '2rem' }}>
                                                <button className="btn-cancel-modern" onClick={() => setShowActionModal(false)}>
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <CenterContentUpload
                                            centerId={actionCenterId}
                                            centerName={centers.find(c => c.id === actionCenterId)?.name || ''}
                                            onClose={() => setShowActionModal(false)}
                                        />
                                    )}
                                </>
                            )}

                            {actionType === 'student' && (
                                <div style={{ maxHeight: '85vh', overflowY: 'auto' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem 1rem 0 0' }}>
                                        <button className="btn-icon" onClick={() => setShowActionModal(false)} style={{ color: '#d966ff', fontSize: '1.5rem', background: 'transparent', border: 'none', cursor: 'pointer' }}>×</button>
                                    </div>
                                    <StudentManagement />
                                </div>
                            )}

                            {actionType === 'course' && (
                                <div style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 0 1rem 0' }}>
                                        <button className="btn-icon" onClick={() => setShowActionModal(false)} style={{ color: '#d966ff', fontSize: '1.5rem', background: 'transparent', border: 'none', cursor: 'pointer' }}>×</button>
                                    </div>
                                    <div className="modal-header">
                                        <div className="modal-icon">📚</div>
                                        <h2 style={{ color: '#d966ff' }}>Crear Materia</h2>
                                        <p style={{ color: '#d966ff' }}>Selecciona el centro y grado donde se creará la materia.</p>
                                    </div>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label style={{ color: '#d966ff', fontWeight: 'bold' }}>Centro Educativo</label>
                                            <select
                                                value={actionCenterId}
                                                onChange={(e) => handleActionCenterChange(e.target.value)}
                                                className="modern-input"
                                                style={{ background: '#f8fafc', color: '#d966ff', border: '1px solid rgba(217, 102, 255, 0.2)' }}
                                            >
                                                <option value="">Seleccione un centro...</option>
                                                {centers.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {actionCenterId && (
                                            <div className="form-group">
                                                <label style={{ color: '#d966ff', fontWeight: 'bold' }}>Grado</label>
                                                {loadingActionGrades ? (
                                                    <p style={{ color: '#d966ff', marginTop: '0.5rem' }}>Cargando grados...</p>
                                                ) : (
                                                    <select
                                                        value={actionGradeId}
                                                        onChange={(e) => setActionGradeId(e.target.value)}
                                                        className="modern-input"
                                                        style={{ background: '#f8fafc', color: '#d966ff', border: '1px solid rgba(217, 102, 255, 0.2)' }}
                                                    >
                                                        <option value="">Seleccione un grado...</option>
                                                        {actionGrades.map(g => (
                                                            <option key={g.id} value={g.id}>{g.name}</option>
                                                        ))}
                                                    </select>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="modal-actions" style={{ marginTop: '2rem' }}>
                                        <button className="btn-cancel-modern" style={{ color: '#d966ff', borderColor: '#d966ff' }} onClick={() => setShowActionModal(false)}>
                                            Cancelar
                                        </button>
                                        <button
                                            className="btn-save-modern"
                                            onClick={handleActionNext}
                                            disabled={!actionCenterId || !actionGradeId}
                                            style={{ background: '#d966ff', color: '#ffffff' }}
                                        >
                                            Continuar a Crear Materia
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default HierarchyConfig
