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
    // const [grades, setGrades] = useState<GradeLevel[]>([])
    // const [selectedGrade, setSelectedGrade] = useState<GradeLevel | null>(null)
    // const [sections, setSections] = useState<Section[]>([])
    // const [selectedSection, setSelectedSection] = useState<Section | null>(null)
    // const [subjects, setSubjects] = useState<Subject[]>([])

    // State for loading and errors
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // State for modals
    const [showCenterModal, setShowCenterModal] = useState(false)
    // const [showGradeModal, setShowGradeModal] = useState(false)
    // const [showSectionModal, setShowSectionModal] = useState(false)
    // const [showSubjectModal, setShowSubjectModal] = useState(false)

    // State for forms
    const [centerForm, setCenterForm] = useState({ name: '', address: '', phone: '', email: '' })
    const [gradeForm, setGradeForm] = useState({ name: '', level: 0 })
    const [sectionForm, setSectionForm] = useState({ name: '', max_students: 30 })
    const [subjectForm, setSubjectForm] = useState({ name: '', description: '', hours_per_week: 0 })

    // State for editing
    const [editingCenter, setEditingCenter] = useState<EducationalCenter | null>(null)
    // const [editingGrade, setEditingGrade] = useState<GradeLevel | null>(null)
    // const [editingSection, setEditingSection] = useState<Section | null>(null)
    // const [editingSubject, setEditingSubject] = useState<Subject | null>(null)

    // Load centers on mount
    useEffect(() => {
        loadCenters()
    }, [])

    // Load grades when center is selected
    /*
    useEffect(() => {
        if (selectedCenter) {
            loadGrades(selectedCenter.id)
        } else {
            setGrades([])
            setSelectedGrade(null)
        }
    }, [selectedCenter])

    // Load sections when grade is selected
    useEffect(() => {
        if (selectedGrade) {
            loadSections(selectedGrade.id)
        } else {
            setSections([])
            setSelectedSection(null)
        }
    }, [selectedGrade])

    // Load subjects when section is selected
    useEffect(() => {
        if (selectedSection) {
            loadSubjects(selectedSection.id)
        } else {
            setSubjects([])
        }
    }, [selectedSection])
    */

    // ========== LOAD FUNCTIONS ==========

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

    /*
    const handleCreateGrade = () => {
        if (!selectedCenter) {
            alert('Selecciona un centro educativo primero')
            return
        }
        setGradeForm({ name: '', level: 0 })
        setEditingGrade(null)
        setShowGradeModal(true)
    }

    const handleEditGrade = (grade: GradeLevel) => {
        setGradeForm({ name: grade.name, level: grade.level || 0 })
        setEditingGrade(grade)
        setShowGradeModal(true)
    }

    const handleSaveGrade = async () => {
        if (!selectedCenter) return

        try {
            setLoading(true)
            if (editingGrade) {
                await updateGrade(editingGrade.id, gradeForm)
            } else {
                await createGrade({ ...gradeForm, center_id: selectedCenter.id })
            }
            await loadGrades(selectedCenter.id)
            setShowGradeModal(false)
        } catch (err: any) {
            setError(err.message || 'Error al guardar grado')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteGrade = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este grado? Se eliminarán todas las secciones y materias asociadas.')) return

        try {
            setLoading(true)
            await deleteGrade(id)
            if (selectedCenter) {
                await loadGrades(selectedCenter.id)
            }
            if (selectedGrade?.id === id) {
                setSelectedGrade(null)
            }
        } catch (err: any) {
            setError(err.message || 'Error al eliminar grado')
        } finally {
            setLoading(false)
        }
    }

    // ========== SECTION FUNCTIONS ==========

    const handleCreateSection = () => {
        if (!selectedGrade) {
            alert('Selecciona un grado primero')
            return
        }
        setSectionForm({ name: '', max_students: 30 })
        setEditingSection(null)
        setShowSectionModal(true)
    }

    const handleEditSection = (section: Section) => {
        setSectionForm({ name: section.name, max_students: section.max_students })
        setEditingSection(section)
        setShowSectionModal(true)
    }

    const handleSaveSection = async () => {
        if (!selectedGrade) return

        try {
            setLoading(true)
            if (editingSection) {
                await updateSection(editingSection.id, sectionForm)
            } else {
                await createSection({ ...sectionForm, grade_id: selectedGrade.id })
            }
            await loadSections(selectedGrade.id)
            setShowSectionModal(false)
        } catch (err: any) {
            setError(err.message || 'Error al guardar sección')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteSection = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta sección? Se eliminarán todas las materias asociadas.')) return

        try {
            setLoading(true)
            await deleteSection(id)
            if (selectedGrade) {
                await loadSections(selectedGrade.id)
            }
            if (selectedSection?.id === id) {
                setSelectedSection(null)
            }
        } catch (err: any) {
            setError(err.message || 'Error al eliminar sección')
        } finally {
            setLoading(false)
        }
    }

    // ========== SUBJECT FUNCTIONS ==========

    const handleCreateSubject = () => {
        if (!selectedSection) {
            alert('Selecciona una sección primero')
            return
        }
        setSubjectForm({ name: '', description: '', hours_per_week: 0 })
        setEditingSubject(null)
        setShowSubjectModal(true)
    }

    const handleEditSubject = (subject: Subject) => {
        setSubjectForm({
            name: subject.name,
            description: subject.description || '',
            hours_per_week: subject.hours_per_week,
        })
        setEditingSubject(subject)
        setShowSubjectModal(true)
    }

    const handleSaveSubject = async () => {
        if (!selectedSection) return

        try {
            setLoading(true)
            if (editingSubject) {
                await updateSubject(editingSubject.id, subjectForm)
            } else {
                await createSubject({ ...subjectForm, section_id: selectedSection.id })
            }
            await loadSubjects(selectedSection.id)
            setShowSubjectModal(false)
        } catch (err: any) {
            setError(err.message || 'Error al guardar materia')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteSubject = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta materia?')) return

        try {
            setLoading(true)
            await deleteSubject(id)
            if (selectedSection) {
                await loadSubjects(selectedSection.id)
            }
        } catch (err: any) {
            setError(err.message || 'Error al eliminar materia')
        } finally {
            setLoading(false)
        }
    }
    */

    // ========== RENDER ==========

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
                            </div>
                        ))}
                    </div>
                )}

                <div className="hierarchy-footer">
                    <button className="btn-start" onClick={handleCreateCenter}>
                        Let's get started
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
