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
    getSubjectsByGrade,
    createSubject,
    updateSubject,
    deleteSubject,
    type EducationalCenter,
    type GradeLevel,
    type Subject,
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
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)

    // State for loading and errors
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // State for modals
    const [showGradeModal, setShowGradeModal] = useState(false)
    const [showSubjectModal, setShowSubjectModal] = useState(false)
    const [showStudentModal, setShowStudentModal] = useState(false)
    const [showTeacherModal, setShowTeacherModal] = useState(false)
    const [showContentModal, setShowContentModal] = useState(false)
    const [showAddTypeModal, setShowAddTypeModal] = useState(false) // New selection modal
    const [showCourseTypeModal, setShowCourseTypeModal] = useState(false) // New selection modal for courses inside grade

    // State for forms
    const [gradeForm, setGradeForm] = useState({ name: '', level: 0 })
    const [subjectForm, setSubjectForm] = useState({
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
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null)

    // Load center and grades on mount
    useEffect(() => {
        if (centerId) {
            loadCenterData(centerId)
            loadGrades(centerId)
        }
    }, [centerId])

    // Load subjects when grade is selected
    useEffect(() => {
        if (selectedGrade) {
            loadSubjects(selectedGrade.id)
        } else if (grades.length > 0) {
            // Auto-select first grade if none is selected
            setSelectedGrade(grades[0])
        } else {
            setSubjects([])
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

    const loadSubjects = async (gradeId: string) => {
        try {
            setLoading(true)
            const data = await getSubjectsByGrade(gradeId)
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

    // ========== SUBJECT FUNCTIONS ==========

    const handleCreateSubject = () => {
        if (!selectedGrade) {
            alert('Selecciona un grado primero')
            return
        }
        setSubjectForm({
            name: '',
            max_students: 30,
            short_name: '',
            description: '',
            start_date: '',
            end_date: '',
            course_id: '',
            visibility: 'active'
        })
        setEditingSubject(null)
        setShowSubjectModal(true)
    }


    const openSubjectDetail = (subject: Subject) => {
        // Navigate to course content view (Moodle-like)
        if (selectedGrade && centerId) {
            navigate(`/admin/school/${centerId}/grade/${selectedGrade.id}/course/${subject.id}/content`)
        }
    }

    const handleSaveSubject = async () => {
        if (!selectedGrade) return

        try {
            setLoading(true)
            if (editingSubject) {
                await updateSubject(editingSubject.id, { ...subjectForm, visibility: subjectForm.visibility as Subject['visibility'] })
            } else {
                await createSubject({ ...subjectForm, grade_id: selectedGrade.id, visibility: subjectForm.visibility as Subject['visibility'] })
            }
            await loadSubjects(selectedGrade.id)
            setShowSubjectModal(false)
        } catch (err: any) {
            setError(err.message || 'Error al guardar materia')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteSubject = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta materia? Se eliminarán todas las secciones asociadas.')) return
        if (!selectedGrade) return

        try {
            setLoading(true)
            await deleteSubject(id)
            await loadSubjects(selectedGrade.id)
            if (selectedSubject?.id === id) {
                setSelectedSubject(null)
            }
        } catch (err: any) {
            setError(err.message || 'Error al eliminar materia')
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

                    <h1 className="center-title" style={{ margin: 0, fontSize: '2.5rem', color: 'white' }}>{center ? center.name : 'Cargando...'}</h1>

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
                            {loading && subjects.length === 0 ? (
                                <p className="empty-text">Cargando materias...</p>
                            ) : subjects.length === 0 ? (
                                <p className="empty-text">No hay materias registradas en este grado.</p>
                            ) : (
                                subjects.map((subject) => (
                                    <div key={subject.id} className="course-list-row" onClick={() => openSubjectDetail(subject)}>
                                        <div className="col-course">
                                            <div className="course-icon-small">📚</div>
                                            <span className="course-name">{subject.name}</span>
                                        </div>
                                        <div className="col-code">
                                            {'-'}
                                        </div>
                                        <div className="col-students">
                                            Max. {subject.max_students}
                                        </div>
                                        <div className="col-actions">
                                            <button
                                                className="btn-icon-small"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    openSubjectDetail(subject)
                                                }}
                                                title="Ver Detalle"
                                            >
                                                👁️
                                            </button>
                                            <button
                                                className="btn-icon-small delete"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDeleteSubject(subject.id)
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
                showSubjectModal && (
                    <div className="modal-overlay" onClick={() => setShowSubjectModal(false)}>
                        <div className="school-modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <div className="modal-icon">👥</div>
                                <h2>{editingSubject ? 'Editar Materia' : 'Nueva Materia'}</h2>
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Nombre *</label>
                                    <input
                                        type="text"
                                        value={subjectForm.name}
                                        onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                                        placeholder="Ej: A"
                                        className="modern-input"
                                        autoFocus
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Máximo de Alumnos</label>
                                    <input
                                        type="number"
                                        value={subjectForm.max_students}
                                        onChange={(e) => setSubjectForm({ ...subjectForm, max_students: parseInt(e.target.value) })}
                                        placeholder="Ej: 30"
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
                        <div className="school-modal-content" style={{ background: '#ffffff' }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 0 1rem 0' }}>
                                <button className="btn-icon" onClick={() => setShowGradeModal(false)} style={{ color: '#1f295a', fontSize: '1.5rem', background: 'transparent', border: 'none', cursor: 'pointer' }}>×</button>
                            </div>
                            <div style={{ textAlign: 'center', padding: '0 0 2rem 0' }}>
                                <h2 style={{ color: '#1f295a', margin: 0 }}>{editingGrade ? 'Editar Grado' : 'Nuevo Grado'}</h2>
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label style={{ color: '#1f295a', fontWeight: 'bold' }}>Nivel*</label>
                                    <select
                                        value={gradeForm.name}
                                        onChange={(e) => setGradeForm({ ...gradeForm, name: e.target.value })}
                                        className="modern-input"
                                        style={{ background: '#f8fafc', color: '#1f295a', border: '1px solid rgba(31, 41, 90, 0.2)' }}
                                        autoFocus
                                    >
                                        <option value="">Seleccione un nivel...</option>
                                        <option value="Primaria">Primaria</option>
                                        <option value="Secundaria">Secundaria</option>
                                        <option value="Preparatoria">Preparatoria</option>
                                        <option value="Universidad">Universidad</option>
                                        {/* Fallback for existing data that doesn't match standard options */}
                                        {gradeForm.name && !['Primaria', 'Secundaria', 'Preparatoria', 'Universidad'].includes(gradeForm.name) && (
                                            <option value={gradeForm.name}>{gradeForm.name}</option>
                                        )}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label style={{ color: '#1f295a', fontWeight: 'bold' }}>{gradeForm.name && gradeForm.name !== 'Primaria' ? 'Semestre' : 'Grado'}</label>
                                    <select
                                        value={gradeForm.level || ''}
                                        onChange={(e) => setGradeForm({ ...gradeForm, level: parseInt(e.target.value) })}
                                        className="modern-input"
                                        style={{ background: '#f8fafc', color: '#1f295a', border: '1px solid rgba(31, 41, 90, 0.2)' }}
                                    >
                                        <option value="">Seleccione un {gradeForm.name && gradeForm.name !== 'Primaria' ? 'semestre' : 'grado'}...</option>
                                        {[1, 2, 3, 4, 5, 6].map(num => (
                                            <option key={num} value={num}>{num}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button className="btn-cancel-modern" style={{ color: '#1f295a', borderColor: '#1f295a' }} onClick={() => setShowGradeModal(false)}>
                                    Cancelar
                                </button>
                                <button
                                    className="btn-save-modern"
                                    onClick={handleSaveGrade}
                                    disabled={!gradeForm.name || loading}
                                    style={{ background: '#1f295a', color: '#ffffff' }}
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
                                        setSelectedSubject(null)
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

