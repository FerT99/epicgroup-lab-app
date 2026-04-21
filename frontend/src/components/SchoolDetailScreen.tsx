import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { User } from '@supabase/supabase-js'
import TopNavigation from './TopNavigation'
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
        } else {
            setSections([])
            setSelectedSection(null)
        }
    }, [selectedGrade])



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
            <TopNavigation
                activeKey="schools"
                userDisplayName={user.user_metadata?.first_name || user.email || 'Usuario'}
                userRole={userRole}
                onNavigate={handleNavigate}
                onLogout={handleLogout}
            />
            <div className="hierarchy-config" style={{ marginTop: '0px', padding: '2rem 4rem' }}>
                {/* MAIN HEADER */}
                <div className="modern-header-row">
                    <div className="header-action-left" style={{ width: '150px' }}>
                        {!selectedGrade && (
                            <button
                                className="btn-back"
                                onClick={() => navigate('/admin/hierarchy')}
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
                    {/* CONDITIONAL RENDER: GRADES LIST or GRADE DETAILS (COURSES) */}
                    {!selectedGrade ? (
                        /* VIEW 1: GRADES GRID */
                        <>
                            <h2 className="section-title">Mis Grados</h2>

                            <div className="grade-card-grid">
                                {loading && grades.length === 0 ? (
                                    <p className="loading-text" style={{ gridColumn: '1 / -1' }}>Cargando grados...</p>
                                ) : grades.length === 0 ? (
                                    <p className="empty-text" style={{ gridColumn: '1 / -1' }}>No hay grados registrados. ¡Agrega uno nuevo!</p>
                                ) : (
                                    grades.map((grade) => (
                                        <div
                                            key={grade.id}
                                            className="grade-card"
                                            onClick={() => setSelectedGrade(grade)}
                                        >
                                            <div className="grade-icon">
                                                📁
                                            </div>
                                            <div className="grade-info">
                                                <h3>{grade.name}</h3>
                                                <p>Primaria secundaria o preparatoria {grade.level}</p>
                                            </div>
                                            <div className="grade-actions">
                                                <button
                                                    className="btn-icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleEditGrade(grade)
                                                    }}
                                                    title="Editar"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="btn-icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleDeleteGrade(grade.id)
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
                        </>
                    ) : (
                        /* VIEW 2: SECTIONS (COURSES) GRID FOR SELECTED GRADE */
                        <>
                            <div className="modern-header-row" style={{ marginBottom: '2rem' }}>
                                <div className="header-action-left" style={{ width: '150px' }}>
                                    <button
                                        className="btn-back"
                                        onClick={() => setSelectedGrade(null)}
                                    >
                                        ← Volver
                                    </button>
                                </div>
                                <h2 className="section-title" style={{ margin: 0, flex: 1, padding: '0 1rem' }}>
                                    {selectedGrade.name} - Cursos
                                </h2>
                                <div className="header-action-right" style={{ width: '150px' }}>
                                    {/* Actions moved to main Add button */}
                                </div>
                            </div>

                            <div className="grade-card-grid">
                                {loading && sections.length === 0 ? (
                                    <p className="loading-text" style={{ gridColumn: '1 / -1' }}>Cargando cursos...</p>
                                ) : sections.length === 0 ? (
                                    <p className="empty-text" style={{ gridColumn: '1 / -1' }}>No hay cursos registrados en este grado.</p>
                                ) : (
                                    sections.map((section) => (
                                        <div
                                            key={section.id}
                                            className="grade-card"
                                            style={{ borderColor: '#d946ef' }} // Pink border for courses to distinguish
                                            onClick={() => openCourseDetail(section)}
                                        >
                                            <div className="grade-icon" style={{ background: '#fce7f3', color: '#db2777' }}>
                                                📚
                                            </div>
                                            <div className="grade-info">
                                                <h3>{section.name}</h3>
                                                <p>{section.short_name || 'Sin código'}</p>
                                                <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Max. {section.max_students} estudiantes</p>
                                            </div>
                                            <div className="grade-actions">
                                                <button
                                                    className="btn-icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        openCourseDetail(section)
                                                    }}
                                                    title="Ver Detalle"
                                                >
                                                    👁️
                                                </button>
                                                <button
                                                    className="btn-icon"
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
                        </>
                    )}
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
                            className="school-modal-content type-selection-content"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>¿Qué deseas agregar?</h2>
                            </div>
                            <div className="type-selection-grid">
                                {!selectedGrade && (
                                    <button
                                        className="selection-card"
                                        onClick={() => {
                                            setShowAddTypeModal(false)
                                            handleCreateGrade()
                                        }}
                                    >
                                        <span className="selection-icon">📚</span>
                                        <div>
                                            <div className="selection-title">Grado</div>
                                            <div className="selection-desc">Crear nuevo grado</div>
                                        </div>
                                    </button>
                                )}
                                <button
                                    className="selection-card"
                                    onClick={() => {
                                        setShowAddTypeModal(false)
                                        setShowStudentModal(true)
                                    }}
                                >
                                    <span className="selection-icon">👨‍🎓</span>
                                    <div>
                                        <div className="selection-title">Alumnos</div>
                                        <div className="selection-desc">Gestionar estudiantes</div>
                                    </div>
                                </button>
                                <button
                                    className="selection-card"
                                    onClick={() => {
                                        setShowAddTypeModal(false)
                                        setShowTeacherModal(true)
                                    }}
                                >
                                    <span className="selection-icon">👨‍🏫</span>
                                    <div>
                                        <div className="selection-title">Maestros</div>
                                        <div className="selection-desc">Gestionar docentes</div>
                                    </div>
                                </button>

                                {selectedGrade && (
                                    <button
                                        className="selection-card"
                                        onClick={() => {
                                            setShowAddTypeModal(false)
                                            if (selectedGrade && centerId) {
                                                navigate(`/admin/school/${centerId}/grade/${selectedGrade.id}/course/new`)
                                            }
                                        }}
                                    >
                                        <span className="selection-icon">📚</span>
                                        <div>
                                            <div className="selection-title">Curso</div>
                                            <div className="selection-desc">Agregar nuevo curso</div>
                                        </div>
                                    </button>
                                )}
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
                            className="school-modal-content"
                            style={{
                                maxWidth: '700px',
                                width: '90%',
                                background: '#1e1e2e', // Explicit dark background
                                color: '#ffffff',      // Explicit white text
                                borderRadius: '24px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                padding: '0' // Remove padding here, let header/body handle it
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
                                <div className="modal-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍🎓</div>
                                <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 'bold' }}>Gestión de Alumnos</h2>
                            </div>
                            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '2rem' }}>
                                <StudentManagement centerId={center?.id} centerName={center?.name} />
                            </div>
                            <div className="modal-actions" style={{ padding: '0 2rem 2rem 2rem', marginTop: '0' }}>
                                <button
                                    className="btn-cancel-modern"
                                    onClick={() => setShowStudentModal(false)}
                                    style={{ padding: '1rem', fontSize: '1rem' }}
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
                            className="school-modal-content"
                            style={{
                                maxWidth: '900px',
                                width: '90%',
                                background: '#1e1e2e', // Explicit dark background
                                color: '#ffffff',      // Explicit white text
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
                                <div className="modal-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍🏫</div>
                                <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 'bold' }}>Gestión de Maestros</h2>
                            </div>
                            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '2rem' }}>
                                {centerId && <TeacherManagement centerId={centerId} centerName={center?.name} />}
                            </div>
                            <div className="modal-actions" style={{ padding: '0 2rem 2rem 2rem', marginTop: '0' }}>
                                <button
                                    className="btn-cancel-modern"
                                    onClick={() => setShowTeacherModal(false)}
                                    style={{ padding: '1rem', fontSize: '1rem' }}
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
                            className="school-modal-content type-selection-content"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>¿Qué deseas agregar al grado?</h2>
                                <p>Selecciona una opción para continuar</p>
                            </div>
                            <div className="type-selection-grid" style={{ gridTemplateColumns: 'repeat(1, 1fr)', maxWidth: '400px', margin: '0 auto' }}>
                                <button
                                    className="selection-card"
                                    onClick={() => {
                                        setShowCourseTypeModal(false)
                                        setSelectedSection(null)
                                        if (selectedGrade && centerId) {
                                            navigate(`/admin/school/${centerId}/grade/${selectedGrade.id}/course/new`)
                                        }
                                    }}
                                >
                                    <span className="selection-icon">📚</span>
                                    <div>
                                        <div className="selection-title">Nuevo Curso</div>
                                        <div className="selection-desc">Crear un nuevo curso desde cero</div>
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

