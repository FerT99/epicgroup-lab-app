import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { User } from '@supabase/supabase-js'
import { getUserRole } from '../utils/getUserRole'
import { auth } from '../lib/supabase'
import {
    getCenterById,
    getGradesByCenter,
    createGrade,
    updateGrade,
    deleteGrade,
    getSectionsByGrade,
    createSection,
    updateSection,
    deleteSection,
    type EducationalCenter,
    type GradeLevel,
    type Section,
} from '../lib/adminApi'
import StudentManagement from './StudentManagement'
import TeacherManagement from './TeacherManagement'
import ContentManagement from './ContentManagement'
import './HierarchyConfig.css' // Reusing styles

interface SchoolDetailScreenProps {
    user: User
}

const SchoolDetailScreen: React.FC<SchoolDetailScreenProps> = ({ user }) => {
    const { centerId } = useParams<{ centerId: string }>()
    const navigate = useNavigate()
    const userRole = getUserRole(user)

    const handleNavigate = (path: string) => {
        navigate(path)
    }

    const handleLogout = async () => {
        await auth.signOut()
    }

    // State for data
    const [center, setCenter] = useState<EducationalCenter | null>(null)
    const [grades, setGrades] = useState<GradeLevel[]>([])
    const [selectedGrade, setSelectedGrade] = useState<GradeLevel | null>(null)
    const [sections, setSections] = useState<Section[]>([])
    const [selectedSection, setSelectedSection] = useState<Section | null>(null)

    // State for loading and errors
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // State for modals
    const [showGradeModal, setShowGradeModal] = useState(false)
    const [showSectionModal, setShowSectionModal] = useState(false)
    const [showStudentModal, setShowStudentModal] = useState(false)
    const [showTeacherModal, setShowTeacherModal] = useState(false)
    const [showContentModal, setShowContentModal] = useState(false)
    const [showAddTypeModal, setShowAddTypeModal] = useState(false) // New selection modal
    const [showCourseTypeModal, setShowCourseTypeModal] = useState(false) // New selection modal for courses inside grade

    // State for forms
    const [gradeForm, setGradeForm] = useState({ name: '', level: 0 })
    const [sectionForm, setSectionForm] = useState({
        name: '',
        max_students: 30,
        short_name: '',
        description: '',
        start_date: '',
        end_date: '',
        course_id: '',
        visibility: 'active'
    })

    // State for editing
    const [editingGrade, setEditingGrade] = useState<GradeLevel | null>(null)
    const [editingSection, setEditingSection] = useState<Section | null>(null)

    // Load center and grades on mount
    useEffect(() => {
        if (centerId) {
            loadCenterData(centerId)
            loadGrades(centerId)
        }
    }, [centerId])

    // Load sections when grade is selected
    useEffect(() => {
        if (selectedGrade) {
            loadSections(selectedGrade.id)
        } else if (grades.length > 0) {
            // Auto-select first grade if none is selected
            setSelectedGrade(grades[0])
        } else {
            setSections([])
        }
    }, [selectedGrade, grades])



    // ========== LOAD FUNCTIONS ==========

    const loadCenterData = async (id: string) => {
        try {
            setLoading(true)
            const data = await getCenterById(id)
            setCenter(data)
        } catch (err: any) {
            setError(err.message || 'Error al cargar centro educativo')
        } finally {
            setLoading(false)
        }
    }

    const loadGrades = async (id: string) => {
        try {
            setLoading(true)
            const data = await getGradesByCenter(id)
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



    // ========== GRADE FUNCTIONS ==========

    const handleCreateGrade = () => {
        if (!center) return
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
        if (!center) return

        try {
            setLoading(true)
            if (editingGrade) {
                await updateGrade(editingGrade.id, gradeForm)
            } else {
                await createGrade({ ...gradeForm, center_id: center.id })
            }
            await loadGrades(center.id)
            setShowGradeModal(false)
        } catch (err: any) {
            setError(err.message || 'Error al guardar grado')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteGrade = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este grado? Se eliminarán todas las secciones y materias asociadas.')) return
        if (!center) return

        try {
            setLoading(true)
            await deleteGrade(id)
            await loadGrades(center.id)
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
        setSectionForm({
            name: '',
            max_students: 30,
            short_name: '',
            description: '',
            start_date: '',
            end_date: '',
            course_id: '',
            visibility: 'active'
        })
        setEditingSection(null)
        setShowSectionModal(true)
    }


    const openCourseDetail = (section: Section) => {
        // Navigate to course content view (Moodle-like)
        if (selectedGrade && centerId) {
            navigate(`/admin/school/${centerId}/grade/${selectedGrade.id}/course/${section.id}/content`)
        }
    }

    const handleSaveSection = async () => {
        if (!selectedGrade) return

        try {
            setLoading(true)
            if (editingSection) {
                await updateSection(editingSection.id, { ...sectionForm, visibility: sectionForm.visibility as Section['visibility'] })
            } else {
                await createSection({ ...sectionForm, grade_id: selectedGrade.id, visibility: sectionForm.visibility as Section['visibility'] })
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
        if (!selectedGrade) return

        try {
            setLoading(true)
            await deleteSection(id)
            await loadSections(selectedGrade.id)
            if (selectedSection?.id === id) {
                setSelectedSection(null)
            }
        } catch (err: any) {
            setError(err.message || 'Error al eliminar sección')
        } finally {
            setLoading(false)
        }
    }




    return (
        <>
            
            <div className="hierarchy-config" style={{ marginTop: '0px', padding: '2rem 4rem' }}>
                {/* MAIN HEADER */}
                <div className="modern-header-row">
                    <div className="header-action-left" style={{ width: '150px' }}>
                        {!selectedGrade && (
                            <button
                                className="btn-back"
                                onClick={() => navigate('/admin')}
                            >
                                ← Volver
                            </button>
                        )}
                    </div>

                    <h1 className="center-title" style={{ margin: 0, fontSize: '2.5rem' }}>{center ? center.name : 'Cargando...'}</h1>

                    <div className="header-action-right" style={{ width: '150px', justifyContent: 'flex-end' }}>
                        <button
                            className="btn-add"
                            onClick={() => setShowAddTypeModal(true)}
                            disabled={!center}
                        >
                            + Agregar
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="error-banner" style={{ maxWidth: '800px', margin: '0 auto 2rem auto' }}>
                        <span>❌ {error}</span>
                        <button onClick={() => setError(null)}>✕</button>
                    </div>
                )}


                <div className="hierarchy-container" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                    
                    {/* FILTER BAR */}
                    <div className="filter-bar-modern">
                        <div className="filter-group">
                            <label>Grado</label>
                            <select 
                                className="modern-select"
                                value={selectedGrade?.id || ''}
                                onChange={(e) => {
                                    const grade = grades.find(g => g.id === e.target.value)
                                    setSelectedGrade(grade || null)
                                }}
                            >
                                {grades.length === 0 && <option value="">Sin grados registrados</option>}
                                {grades.map(grade => (
                                    <option key={grade.id} value={grade.id}>
                                        {grade.name} (Nivel {grade.level})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-actions">
                            
                        </div>
                    </div>

                    {/* COURSES LIST VIEW */}
                    <div className="courses-list-container">
                        <div className="courses-list-header">
                            <div className="col-course">Curso</div>
                            <div className="col-code">Código</div>
                            <div className="col-students">Capacidad</div>
                            <div className="col-actions">Acciones</div>
                        </div>

                        <div className="courses-list-body">
                            {loading && sections.length === 0 ? (
                                <p className="empty-text">Cargando cursos...</p>
                            ) : sections.length === 0 ? (
                                <p className="empty-text">No hay cursos registrados en este grado.</p>
                            ) : (
                                sections.map((section) => (
                                    <div key={section.id} className="course-list-row" onClick={() => openCourseDetail(section)}>
                                        <div className="col-course">
                                            <div className="course-icon-small">📚</div>
                                            <span className="course-name">{section.name}</span>
                                        </div>
                                        <div className="col-code">
                                            {section.short_name || '-'}
                                        </div>
                                        <div className="col-students">
                                            Max. {section.max_students}
                                        </div>
                                        <div className="col-actions">
                                            <button
                                                className="btn-icon-small"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    openCourseDetail(section)
                                                }}
                                                title="Ver Detalle"
                                            >
                                                👁️
                                            </button>
                                            <button
                                                className="btn-icon-small delete"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDeleteSection(section.id)
                                                }}
                                                title="Eliminar"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div >



            {
                showSectionModal && (
                    <div className="modal-overlay" onClick={() => setShowSectionModal(false)}>
                        <div className="school-modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <div className="modal-icon">👥</div>
                                <h2>{editingSection ? 'Editar Sección' : 'Nueva Sección'}</h2>
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Nombre *</label>
                                    <input
                                        type="text"
                                        value={sectionForm.name}
                                        onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                                        placeholder="Ej: A"
                                        className="modern-input"
                                        autoFocus
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Máximo de Alumnos</label>
                                    <input
                                        type="number"
                                        value={sectionForm.max_students}
                                        onChange={(e) => setSectionForm({ ...sectionForm, max_students: parseInt(e.target.value) })}
                                        placeholder="Ej: 30"
                                        className="modern-input"
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button className="btn-cancel-modern" onClick={() => setShowSectionModal(false)}>
                                    Cancelar
                                </button>
                                <button
                                    className="btn-save-modern"
                                    onClick={handleSaveSection}
                                    disabled={!sectionForm.name || loading}
                                >
                                    {loading ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showContentModal && (
                    <div className="modal-overlay" onClick={() => setShowContentModal(false)}>
                        <div
                            className="school-modal-content"
                            style={{
                                maxWidth: '900px',
                                width: '90%',
                                background: '#1e1e2e',
                                color: '#ffffff',
                                borderRadius: '24px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                padding: '0'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header" style={{
                                background: 'rgba(255,255,255,0.03)',
                                padding: '2rem',
                                borderBottom: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '24px 24px 0 0',
                                marginBottom: 0
                            }}>
                                <div className="modal-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
                                <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 'bold' }}>Gestión de Contenido</h2>
                                {!selectedGrade && (
                                    <p style={{ color: '#ef4444', marginTop: '0.5rem' }}>
                                        Por favor, selecciona un grado primero
                                    </p>
                                )}
                            </div>
                            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '2rem' }}>
                                <ContentManagement gradeId={selectedGrade?.id} gradeName={selectedGrade?.name} />
                            </div>
                            <div className="modal-actions" style={{ padding: '0 2rem 2rem 2rem', marginTop: '0' }}>
                                <button
                                    className="btn-cancel-modern"
                                    onClick={() => setShowContentModal(false)}
                                    style={{ padding: '1rem', fontSize: '1rem' }}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* MODALS */}
            {/* TYPE SELECTION MODAL */}
            {
                showAddTypeModal && (
                    <div className="modal-overlay" onClick={() => setShowAddTypeModal(false)}>
                        <div
                            className="type-selection-content"
                            style={{
                                background: '#ffffff',
                                color: '#1f295a',
                                borderRadius: '24px',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                padding: '2rem',
                                maxWidth: '500px',
                                width: '100%'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: '0', background: 'transparent' }}>
                                <h2 style={{ color: '#1f295a', fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>¿Qué deseas agregar?</h2>
                            </div>
                            <div className="type-selection-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                                <button
                                    className="selection-card"
                                    style={{ background: '#1f295a', color: '#ffffff', border: 'none', borderRadius: '30px', padding: '1.5rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                                    onClick={() => {
                                        setShowAddTypeModal(false)
                                        handleCreateGrade()
                                    }}
                                >
                                    <span className="selection-icon" style={{ fontSize: '2rem', filter: 'none' }}>📚</span>
                                    <div>
                                        <div className="selection-title" style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.25rem', color: '#ffffff' }}>Grado</div>
                                        <div className="selection-desc" style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>Crear nuevo grado</div>
                                    </div>
                                </button>

                                <button
                                    className="selection-card"
                                    style={{ background: '#1f295a', color: '#ffffff', border: 'none', borderRadius: '30px', padding: '1.5rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                                    onClick={() => {
                                        setShowAddTypeModal(false)
                                        setShowStudentModal(true)
                                    }}
                                >
                                    <span className="selection-icon" style={{ fontSize: '2rem', filter: 'none' }}>👨‍🎓</span>
                                    <div>
                                        <div className="selection-title" style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.25rem', color: '#ffffff' }}>Alumnos</div>
                                        <div className="selection-desc" style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>Gestionar estudiantes</div>
                                    </div>
                                </button>

                                <button
                                    className="selection-card"
                                    style={{ background: '#1f295a', color: '#ffffff', border: 'none', borderRadius: '30px', padding: '1.5rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                                    onClick={() => {
                                        setShowAddTypeModal(false)
                                        setShowTeacherModal(true)
                                    }}
                                >
                                    <span className="selection-icon" style={{ fontSize: '2rem', filter: 'none' }}>👨‍🏫</span>
                                    <div>
                                        <div className="selection-title" style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.25rem', color: '#ffffff' }}>Maestros</div>
                                        <div className="selection-desc" style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>Gestionar docentes</div>
                                    </div>
                                </button>

                                <button
                                    className="selection-card"
                                    style={{ background: '#1f295a', color: '#ffffff', border: 'none', borderRadius: '30px', padding: '1.5rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', opacity: selectedGrade ? 1 : 0.6 }}
                                    onClick={() => {
                                        if (!selectedGrade) {
                                            alert('Por favor selecciona un grado primero para agregar un curso.')
                                            return
                                        }
                                        setShowAddTypeModal(false)
                                        if (selectedGrade && centerId) {
                                            navigate(`/admin/school/${centerId}/grade/${selectedGrade.id}/course/new`)
                                        }
                                    }}
                                >
                                    <span className="selection-icon" style={{ fontSize: '2rem', filter: 'none' }}>📖</span>
                                    <div>
                                        <div className="selection-title" style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.25rem', color: '#ffffff' }}>Curso</div>
                                        <div className="selection-desc" style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>Agregar nuevo curso</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showGradeModal && (
                    <div className="modal-overlay" onClick={() => setShowGradeModal(false)}>
                        <div className="school-modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <div className="modal-icon">📚</div>
                                <h2>{editingGrade ? 'Editar Grado' : 'Nuevo Grado'}</h2>
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Primaria, secundaria, preparatoria o universidad*</label>
                                    <input
                                        type="text"
                                        value={gradeForm.name}
                                        onChange={(e) => setGradeForm({ ...gradeForm, name: e.target.value })}
                                        placeholder="Ej: 1ro Primaria"
                                        className="modern-input"
                                        autoFocus
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Grado</label>
                                    <input
                                        type="number"
                                        value={gradeForm.level}
                                        onChange={(e) => setGradeForm({ ...gradeForm, level: parseInt(e.target.value) })}
                                        placeholder="Ej: 1"
                                        className="modern-input"
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button className="btn-cancel-modern" onClick={() => setShowGradeModal(false)}>
                                    Cancelar
                                </button>
                                <button
                                    className="btn-save-modern"
                                    onClick={handleSaveGrade}
                                    disabled={!gradeForm.name || loading}
                                >
                                    {loading ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showStudentModal && (
                    <div className="modal-overlay" onClick={() => setShowStudentModal(false)}>
                        <div
                            style={{
                                maxWidth: '700px',
                                width: '90%',
                                maxHeight: '90vh',
                                display: 'flex',
                                flexDirection: 'column',
                                background: '#ffffff',
                                color: '#1f295a',
                                borderRadius: '24px',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                padding: '0'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header" style={{
                                background: 'transparent',
                                padding: '2rem',
                                borderBottom: '1px solid rgba(0,0,0,0.1)',
                                borderRadius: '24px 24px 0 0',
                                marginBottom: 0,
                                textAlign: 'center'
                            }}>
                                <h2 style={{ color: '#1f295a', fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>Gestión de Alumnos</h2>
                            </div>
                            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '2rem', background: 'transparent' }}>
                                <StudentManagement centerId={center?.id} centerName={center?.name} gradeId={selectedGrade?.id} />
                            </div>
                            <div className="modal-actions" style={{ padding: '0 2rem 2rem 2rem', marginTop: '0', display: 'flex', justifyContent: 'center' }}>
                                <button
                                    className="btn-cancel-modern"
                                    onClick={() => setShowStudentModal(false)}
                                    style={{ padding: '1rem', fontSize: '1rem', background: '#e2e8f0', color: '#1f295a', maxWidth: '200px' }}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showTeacherModal && (
                    <div className="modal-overlay" onClick={() => setShowTeacherModal(false)}>
                        <div
                            style={{
                                maxWidth: '900px',
                                width: '90%',
                                maxHeight: '90vh',
                                display: 'flex',
                                flexDirection: 'column',
                                background: '#ffffff',
                                color: '#1f295a',
                                borderRadius: '24px',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                padding: '0'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header" style={{
                                background: 'transparent',
                                padding: '2rem',
                                borderBottom: '1px solid rgba(0,0,0,0.1)',
                                borderRadius: '24px 24px 0 0',
                                marginBottom: 0,
                                textAlign: 'center'
                            }}>
                                <h2 style={{ color: '#1f295a', fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>Gestión de Maestros</h2>
                            </div>
                            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '2rem', background: 'transparent' }}>
                                {centerId && <TeacherManagement centerId={centerId} centerName={center?.name} />}
                            </div>
                            <div className="modal-actions" style={{ padding: '0 2rem 2rem 2rem', marginTop: '0', display: 'flex', justifyContent: 'center' }}>
                                <button
                                    className="btn-cancel-modern"
                                    onClick={() => setShowTeacherModal(false)}
                                    style={{ padding: '1rem', fontSize: '1rem', background: '#e2e8f0', color: '#1f295a', maxWidth: '200px' }}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* NEW: TYPE SELECTION MODAL FOR COURSES (INSIDE GRADE) */}
            {
                showCourseTypeModal && (
                    <div className="modal-overlay" onClick={() => setShowCourseTypeModal(false)}>
                        <div
                            className="type-selection-content"
                            style={{
                                background: '#ffffff',
                                color: '#1f295a',
                                borderRadius: '24px',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                padding: '2rem',
                                maxWidth: '500px',
                                width: '100%'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: '0', background: 'transparent' }}>
                                <h2 style={{ color: '#1f295a', fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>¿Qué deseas agregar al grado?</h2>
                                <p style={{ color: '#4b5563', marginTop: '0.5rem' }}>Selecciona una opción para continuar</p>
                            </div>
                            <div className="type-selection-grid" style={{ gridTemplateColumns: 'repeat(1, 1fr)', maxWidth: '400px', margin: '0 auto' }}>
                                <button
                                    className="selection-card"
                                    style={{ background: '#1f295a', color: '#ffffff', border: 'none', borderRadius: '30px', padding: '1.5rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                                    onClick={() => {
                                        setShowCourseTypeModal(false)
                                        setSelectedSection(null)
                                        if (selectedGrade && centerId) {
                                            navigate(`/admin/school/${centerId}/grade/${selectedGrade.id}/course/new`)
                                        }
                                    }}
                                >
                                    <span className="selection-icon" style={{ fontSize: '2rem', filter: 'none' }}>📚</span>
                                    <div>
                                        <div className="selection-title" style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.25rem', color: '#ffffff' }}>Nuevo Curso</div>
                                        <div className="selection-desc" style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>Crear un nuevo curso desde cero</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    )
}

export default SchoolDetailScreen

