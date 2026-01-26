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
    getSubjectsBySection,
    createSubject,
    updateSubject,
    deleteSubject,
    type EducationalCenter,
    type GradeLevel,
    type Section,
    type Subject,
} from '../lib/adminApi'
import StudentManagement from './StudentManagement'
import TeacherManagement from './TeacherManagement'
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
    const [subjects, setSubjects] = useState<Subject[]>([])

    // State for loading and errors
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // State for modals
    const [showGradeModal, setShowGradeModal] = useState(false)
    const [showSectionModal, setShowSectionModal] = useState(false)
    const [showSubjectModal, setShowSubjectModal] = useState(false)
    const [showStudentModal, setShowStudentModal] = useState(false)
    const [showTeacherModal, setShowTeacherModal] = useState(false)
    const [showAddTypeModal, setShowAddTypeModal] = useState(false) // New selection modal

    // State for forms
    const [gradeForm, setGradeForm] = useState({ name: '', level: 0 })
    const [sectionForm, setSectionForm] = useState({ name: '', max_students: 30 })
    const [subjectForm, setSubjectForm] = useState({ name: '', description: '', hours_per_week: 0 })

    // State for editing
    const [editingGrade, setEditingGrade] = useState<GradeLevel | null>(null)
    const [editingSection, setEditingSection] = useState<Section | null>(null)
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null)

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

    // Load subjects when section is selected
    useEffect(() => {
        if (selectedSection) {
            loadSubjects(selectedSection.id)
        } else {
            setSubjects([])
        }
    }, [selectedSection])

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
        if (!selectedSection) return

        try {
            setLoading(true)
            await deleteSubject(id)
            await loadSubjects(selectedSection.id)
        } catch (err: any) {
            setError(err.message || 'Error al eliminar materia')
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
                <div className="hierarchy-header" style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', width: '95%' }}>
                    <button className="btn-back" onClick={() => navigate('/admin/hierarchy')} style={{ justifySelf: 'start' }}>
                        ← Escuelas
                    </button>
                    <h1>{center ? center.name : 'Cargando...'}</h1>
                    <button
                        className="btn-add"
                        style={{ padding: '10px 20px', fontSize: '1rem', justifySelf: 'end' }}
                        onClick={() => setShowAddTypeModal(true)}
                        disabled={!center}
                    >
                        + Agregar
                    </button>
                </div>

                {error && (
                    <div className="error-banner">
                        <span>❌ {error}</span>
                        <button onClick={() => setError(null)}>✕</button>
                    </div>
                )}

                <div className="hierarchy-grid">
                    {/* COLUMN 1: GRADES */}
                    <div className="hierarchy-column">
                        <div className="column-header">
                            <h2>📚 Grados</h2>
                            <button
                                className="btn-add"
                                onClick={handleCreateGrade}
                                disabled={!center}
                            >
                                + Agregar
                            </button>
                        </div>

                        <div className="items-list">
                            {loading && grades.length === 0 ? (
                                <p className="loading-text">Cargando...</p>
                            ) : grades.length === 0 ? (
                                <p className="empty-text">No hay grados registrados</p>
                            ) : (
                                grades.map((grade) => (
                                    <div
                                        key={grade.id}
                                        className={`item-card ${selectedGrade?.id === grade.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedGrade(grade)}
                                    >
                                        <div className="item-info">
                                            <h3>{grade.name}</h3>
                                            {grade.level !== undefined && (
                                                <p className="item-detail">Nivel {grade.level}</p>
                                            )}
                                        </div>
                                        <div className="item-actions">
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
                    </div>

                    {/* COLUMN 2: SECTIONS */}
                    <div className="hierarchy-column">
                        <div className="column-header">
                            <h2>👥 Secciones</h2>
                            <button
                                className="btn-add"
                                onClick={handleCreateSection}
                                disabled={!selectedGrade}
                            >
                                + Agregar
                            </button>
                        </div>

                        <div className="items-list">
                            {!selectedGrade ? (
                                <p className="empty-text">Selecciona un grado primero</p>
                            ) : loading && sections.length === 0 ? (
                                <p className="loading-text">Cargando...</p>
                            ) : sections.length === 0 ? (
                                <p className="empty-text">No hay secciones registradas</p>
                            ) : (
                                sections.map((section) => (
                                    <div
                                        key={section.id}
                                        className={`item-card ${selectedSection?.id === section.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedSection(section)}
                                    >
                                        <div className="item-info">
                                            <h3>Sección {section.name}</h3>
                                            <p className="item-detail">Máx. {section.max_students} alumnos</p>
                                        </div>
                                        <div className="item-actions">
                                            <button
                                                className="btn-icon"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleEditSection(section)
                                                }}
                                                title="Editar"
                                            >
                                                ✏️
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
                    </div>

                    {/* COLUMN 3: SUBJECTS */}
                    <div className="hierarchy-column">
                        <div className="column-header">
                            <h2>📖 Materias</h2>
                            <button
                                className="btn-add"
                                onClick={handleCreateSubject}
                                disabled={!selectedSection}
                            >
                                + Agregar
                            </button>
                        </div>

                        <div className="items-list">
                            {!selectedSection ? (
                                <p className="empty-text">Selecciona una sección primero</p>
                            ) : loading && subjects.length === 0 ? (
                                <p className="loading-text">Cargando...</p>
                            ) : subjects.length === 0 ? (
                                <p className="empty-text">No hay materias registradas</p>
                            ) : (
                                subjects.map((subject) => (
                                    <div key={subject.id} className="item-card">
                                        <div className="item-info">
                                            <h3>{subject.name}</h3>
                                            {subject.hours_per_week > 0 && (
                                                <p className="item-detail">{subject.hours_per_week} hrs/semana</p>
                                            )}
                                        </div>
                                        <div className="item-actions">
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleEditSubject(subject)}
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleDeleteSubject(subject.id)}
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
            </div>

            {/* MODALS */}
            {/* TYPE SELECTION MODAL */}
            {showAddTypeModal && (
                <div className="modal-overlay" onClick={() => setShowAddTypeModal(false)}>
                    <div className="school-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
                        <div className="modal-header">
                            <h2>¿Qué deseas agregar?</h2>
                            <p>Selecciona una opción para administrar.</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                            <button
                                onClick={() => {
                                    setShowAddTypeModal(false)
                                    setShowStudentModal(true)
                                }}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '16px',
                                    padding: '2rem 1rem',
                                    color: 'white',
                                    fontSize: '1.2rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            >
                                <span style={{ fontSize: '2.5rem' }}>👨‍🎓</span>
                                Alumnos
                            </button>
                            <button
                                onClick={() => {
                                    setShowAddTypeModal(false)
                                    setShowTeacherModal(true)
                                }}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '16px',
                                    padding: '2rem 1rem',
                                    color: 'white',
                                    fontSize: '1.2rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            >
                                <span style={{ fontSize: '2.5rem' }}>👨‍🏫</span>
                                Maestros
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                                    <label>Nombre *</label>
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
                                    <label>Nivel</label>
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
                showSubjectModal && (
                    <div className="modal-overlay" onClick={() => setShowSubjectModal(false)}>
                        <div className="school-modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <div className="modal-icon">📖</div>
                                <h2>{editingSubject ? 'Editar Materia' : 'Nueva Materia'}</h2>
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Nombre *</label>
                                    <input
                                        type="text"
                                        value={subjectForm.name}
                                        onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                                        placeholder="Ej: Matemáticas"
                                        className="modern-input"
                                        autoFocus
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Descripción</label>
                                    <textarea
                                        value={subjectForm.description}
                                        onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                                        placeholder="Descripción opcional"
                                        rows={3}
                                        className="modern-input"
                                        style={{ resize: 'vertical' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Horas por Semana</label>
                                    <input
                                        type="number"
                                        value={subjectForm.hours_per_week}
                                        onChange={(e) => setSubjectForm({ ...subjectForm, hours_per_week: parseInt(e.target.value) })}
                                        placeholder="Ej: 5"
                                        className="modern-input"
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button className="btn-cancel-modern" onClick={() => setShowSubjectModal(false)}>
                                    Cancelar
                                </button>
                                <button
                                    className="btn-save-modern"
                                    onClick={handleSaveSubject}
                                    disabled={!subjectForm.name || loading}
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
                        <div className="school-modal-content" style={{ maxWidth: '800px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <div className="modal-icon">👨‍🎓</div>
                                <h2>Gestión de Alumnos</h2>
                            </div>
                            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                <StudentManagement centerId={center?.id} centerName={center?.name} />
                            </div>
                            <div className="modal-actions" style={{ marginTop: '20px' }}>
                                <button className="btn-cancel-modern" onClick={() => setShowStudentModal(false)}>
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
                        <div className="school-modal-content" style={{ maxWidth: '800px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <div className="modal-icon">👨‍🏫</div>
                                <h2>Gestión de Maestros</h2>
                            </div>
                            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                {centerId && <TeacherManagement centerId={centerId} centerName={center?.name} />}
                            </div>
                            <div className="modal-actions" style={{ marginTop: '20px' }}>
                                <button className="btn-cancel-modern" onClick={() => setShowTeacherModal(false)}>
                                    Cerrar
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
