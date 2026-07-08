import React, { useState, useEffect, useCallback } from 'react'
import './HierarchyConfig.css'

interface UserData {
    email: string
    password: string
    full_name: string
}

interface Results {
    success: number
    errors: number
    errorDetails: { email: string; error: string }[]
    processed: { email: string; status: 'success' | 'error'; message: string }[]
}

interface EnrolledStudent {
    id: string
    name: string
    email: string
    avatar_url?: string
}

interface StudentManagementProps {
    centerId?: string
    centerName?: string
    gradeId?: string
}

const API = 'http://localhost:3001'

// ── Tutor Modal ──────────────────────────────────────────────────────────────
interface TutorModalProps {
    student: EnrolledStudent
    onClose: () => void
    onSuccess: () => void
}

const TutorModal: React.FC<TutorModalProps> = ({ student, onClose, onSuccess }) => {
    const [form, setForm] = useState({ fullName: '', email: '', password: '' })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.fullName || !form.email || !form.password) {
            setError('Todos los campos son requeridos.')
            return
        }
        setSubmitting(true)
        setError('')
        try {
            const res = await fetch(`${API}/api/admin/students/${student.id}/tutor`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName: form.fullName, email: form.email, password: form.password })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Error al crear tutor')
            if (data.warning) {
                alert(`Tutor creado con éxito, pero no se pudo vincular automáticamente: ${data.warning}\n\nAsegúrate de que la tabla "student_tutors" exista en tu base de datos.`)
            } else {
                alert(`Tutor "${form.fullName}" creado y vinculado a ${student.name} exitosamente.`)
            }
            onSuccess()
            onClose()
        } catch (err: any) {
            setError(err.message || 'Error desconocido')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <div style={{
                background: 'linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%)',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: '16px',
                padding: '2rem',
                width: '100%',
                maxWidth: '440px',
                boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                color: '#fff'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#a5b4fc' }}>🔗 Vincular Tutor</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                            Alumno: <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{student.name}</strong>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}
                    >×</button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                        <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>
                            Nombre Completo *
                        </label>
                        <input
                            type="text"
                            className="modern-input"
                            placeholder="Ej: María García López"
                            value={form.fullName}
                            onChange={e => setForm({ ...form, fullName: e.target.value })}
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>
                            Correo Electrónico *
                        </label>
                        <input
                            type="email"
                            className="modern-input"
                            placeholder="tutor@ejemplo.com"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>
                            Contraseña *
                        </label>
                        <input
                            type="text"
                            className="modern-input"
                            placeholder="Contraseña temporal"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                        />
                    </div>

                    {error && (
                        <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#fca5a5', fontSize: '0.85rem' }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '0.9rem' }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                flex: 2, padding: '10px',
                                background: submitting ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                border: 'none', borderRadius: '8px', color: '#fff',
                                cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '0.9rem', fontWeight: 600
                            }}
                        >
                            {submitting ? 'Creando tutor...' : '🔗 Crear y Vincular Tutor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ── Tutors List Modal ────────────────────────────────────────────────────────
interface TutorsListModalProps {
    student: EnrolledStudent
    tutors: any[]
    onClose: () => void
}

const TutorsListModal: React.FC<TutorsListModalProps> = ({ student, tutors, onClose }) => {
    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <div style={{
                background: 'linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%)',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: '16px',
                padding: '2rem',
                width: '100%',
                maxWidth: '440px',
                maxHeight: '70vh',
                overflowY: 'auto',
                boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                color: '#fff'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#a5b4fc' }}>📋 Tutores</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                            Alumno: <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{student.name}</strong>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}
                    >×</button>
                </div>

                {tutors.length === 0 ? (
                    <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '1rem 0' }}>
                        Este alumno no tiene tutores vinculados.
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {tutors.map((tutor) => (
                            <div
                                key={tutor.id}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '10px',
                                    padding: '0.75rem 1rem'
                                }}
                            >
                                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{tutor.full_name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{tutor.email}</div>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    onClick={onClose}
                    style={{
                        marginTop: '1.5rem', width: '100%', padding: '10px',
                        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '8px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '0.9rem'
                    }}
                >
                    Cerrar
                </button>
            </div>
        </div>
    )
}

// ── Main Component ────────────────────────────────────────────────────────────
const StudentManagement: React.FC<StudentManagementProps> = ({ centerName, centerId, gradeId }) => {
    // ── Registered students in this grade ──────────────────────────────
    const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([])
    const [loadingEnrolled, setLoadingEnrolled] = useState(false)

    // ── Tutor modal ────────────────────────────────────────────────────
    const [tutorTarget, setTutorTarget] = useState<EnrolledStudent | null>(null)

    // ── Add-student tabs ───────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState<'manual' | 'csv' | 'existing'>('manual')

    // ── Manual creation ────────────────────────────────────────────────
    const [createForm, setCreateForm] = useState({ fullName: '', email: '', password: 'ingles2025' })
    const [creating, setCreating] = useState(false)

    // ── Existing-student search ────────────────────────────────────────
    const [allStudents, setAllStudents] = useState<EnrolledStudent[]>([])
    const [loadingAll, setLoadingAll] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [enrollingId, setEnrollingId] = useState<string | null>(null)

    // ── CSV import ─────────────────────────────────────────────────────
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<Results | null>(null)
    const [failedUsers, setFailedUsers] = useState<UserData[]>([])
    const [parsing, setParsing] = useState(false)

    // ── Delete ─────────────────────────────────────────────────────────
    const [isDeleting, setIsDeleting] = useState<string | null>(null)

    // ── View Tutors ────────────────────────────────────────────────────
    const [showTutors, setShowTutors] = useState(false)
    const [tutors, setTutors] = useState<any[]>([])

    // ── Fetch students enrolled in this grade ──────────────────────────
    const fetchEnrolledStudents = useCallback(async () => {
        if (!gradeId) return
        setLoadingEnrolled(true)
        try {
            const res = await fetch(`${API}/api/admin/grades/${gradeId}/students`)
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const data = await res.json()
            setEnrolledStudents(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error('Error fetching enrolled students:', err)
        } finally {
            setLoadingEnrolled(false)
        }
    }, [gradeId])

    useEffect(() => { fetchEnrolledStudents() }, [fetchEnrolledStudents])

    // ── Fetch ALL platform students when "existing" tab opens ──────────
    useEffect(() => {
        if (activeTab !== 'existing') return
        setAllStudents([])
        setSearchQuery('')
        setLoadingAll(true)
        fetch(`${API}/api/users/students`)
            .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
            .then(data => setAllStudents(Array.isArray(data) ? data : []))
            .catch(err => console.error('Error fetching all students:', err))
            .finally(() => setLoadingAll(false))
    }, [activeTab])

    // ── Helpers ────────────────────────────────────────────────────────
    const createStudent = async (form: typeof createForm) => {
        const res = await fetch(`${API}/api/admin/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: form.email, password: form.password, fullName: form.fullName, role: 'student' })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Error creando alumno')
        return data.user
    }

    const enrollStudent = async (studentId: string) => {
        const res = await fetch(`${API}/api/admin/enrollments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ center_id: centerId, grade_id: gradeId, student_id: studentId })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Error inscribiendo alumno')
        return data
    }

    const handleCreateStudent = async () => {
        try {
            setCreating(true)
            const user = await createStudent(createForm)
            if (user?.id) await enrollStudent(user.id)
            setCreateForm({ fullName: '', email: '', password: 'ingles2025' })
            alert('Alumno creado e inscrito exitosamente')
            fetchEnrolledStudents()
        } catch (err: any) {
            alert(err.message || 'Error al crear alumno')
        } finally {
            setCreating(false)
        }
    }

    const handleEnrollExisting = async (student: EnrolledStudent) => {
        try {
            setEnrollingId(student.id)
            await enrollStudent(student.id)
            alert(`${student.name} inscrito/a exitosamente en este grado y sus materias.`)
            fetchEnrolledStudents()
        } catch (err: any) {
            alert(err.message || 'Error al inscribir')
        } finally {
            setEnrollingId(null)
        }
    }

    const handleViewTutors = async (student: EnrolledStudent) => {
        try {
            const res = await fetch(`${API}/api/admin/students/${student.id}/tutors`, { method: 'GET' })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Error al obtener tutores')
            setTutors(data)
            setTutorTarget(student)  
            setShowTutors(true)
        } catch (err: any) {
            alert(err.message || 'Error al obtener tutores')
        }
    }

    const handleRemoveFromGrade = async (student: EnrolledStudent) => {
        if (!confirm(`¿Quitar a ${student.name} de este grado?`)) return
        setIsDeleting(student.id)
        try {
            const res = await fetch(`${API}/api/admin/grades/${gradeId}/students/${student.id}`, { method: 'DELETE' })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Error al quitar alumno')
            }
            setEnrolledStudents(prev => prev.filter(s => s.id !== student.id))
        } catch (err: any) {
            alert(err.message)
        } finally {
            setIsDeleting(null)
        }
    }

    const importCustomUsers = async (users: UserData[]) => {
        setLoading(true)
        setResults(null)
        setFailedUsers([])
        const res: Results = { success: 0, errors: 0, errorDetails: [], processed: [] }
        for (const user of users) {
            try {
                const createdUser = await createStudent({
                    fullName: user.full_name,
                    email: user.email,
                    password: user.password
                })
                if (createdUser?.id) {
                    await enrollStudent(createdUser.id)
                }
                res.success++
                res.processed.push({ email: user.email, status: 'success', message: 'OK' })
            } catch (error: any) {
                res.errors++
                res.errorDetails.push({ email: user.email, error: error.message })
                setFailedUsers(prev => [...prev, user])
            }
            await new Promise(r => setTimeout(r, 100))
        }
        setResults(res)
        setLoading(false)
        fetchEnrolledStudents()
    }
    
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return
        setParsing(true)
        const reader = new FileReader()
        reader.onload = async (e) => {
            const text = e.target?.result as string
            if (!text) return
            const lines = text.split(/\r\n|\n/)
            const parsed: UserData[] = []
            let start = 0
            if (lines[0].toLowerCase().includes('email')) start = 1
            for (let i = start; i < lines.length; i++) {
                const line = lines[i].trim()
                if (!line) continue
                const parts = line.split(',')
                if (parts.length >= 3) {
                    parsed.push({ email: parts[0].trim(), password: parts[1]?.trim() || 'ingles2025', full_name: parts[2].trim() })
                }
            }
            if (confirm(`Se encontraron ${parsed.length} usuarios en el CSV. ¿Deseas insertarlos ahora?`)) {
                await importCustomUsers(parsed)
            }
            setParsing(false)
            if (event.target) event.target.value = ''
        }
        reader.readAsText(file)
    }

    // ── Filtered search results ────────────────────────────────────────
    const filteredStudents = searchQuery.trim().length < 1
        ? allStudents
        : allStudents.filter(s =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.email.toLowerCase().includes(searchQuery.toLowerCase())
        )

    return (
        <>
            {/* ── Tutor Modal (portal-style, rendered outside main flow) ── */}
            {tutorTarget && !showTutors && (
                <TutorModal
                    student={tutorTarget}
                    onClose={() => setTutorTarget(null)}
                    onSuccess={fetchEnrolledStudents}
                />
            )}
            {showTutors && tutorTarget && (
                <TutorsListModal
                    student={tutorTarget}
                    tutors={tutors}
                    onClose={() => { setShowTutors(false); setTutorTarget(null) }}
                />
            )}

            <div className="hierarchy-config-modal-panel" style={{ marginTop: 0, background: '#1e1e2e', color: '#ffffff' }}>

                {/* ── Add Student Tabs ── */}
                <div className="admin-tabs">
                    <button className={`tab-button ${activeTab === 'manual' ? 'active' : ''}`} onClick={() => setActiveTab('manual')}>
                        👤 Crear Manualmente
                    </button>
                    <button className={`tab-button ${activeTab === 'csv' ? 'active' : ''}`} onClick={() => setActiveTab('csv')}>
                        📂 Importar desde CSV
                    </button>
                    <button className={`tab-button ${activeTab === 'existing' ? 'active' : ''}`} onClick={() => setActiveTab('existing')}>
                        🔍 Buscar Existente
                    </button>
                </div>

                {/* ── Manual Tab ── */}
                {activeTab === 'manual' && (
                    <div className="form-grid">
                        <h4 style={{ color: '#fff', margin: 0 }}>Registrar Nuevo Alumno</h4>
                        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr auto', alignItems: 'end' }}>
                            <div className="form-group">
                                <label>Nombre Completo *</label>
                                <input type="text" value={createForm.fullName} onChange={e => setCreateForm({ ...createForm, fullName: e.target.value })} placeholder="Ej: Juanito Pérez" className="modern-input" />
                            </div>
                            <div className="form-group">
                                <label>Correo Electrónico *</label>
                                <input type="email" value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })} placeholder="juanito@escuela.com" className="modern-input" />
                            </div>
                            <div className="form-group">
                                <label>Contraseña *</label>
                                <input type="text" value={createForm.password} onChange={e => setCreateForm({ ...createForm, password: e.target.value })} placeholder="Contraseña" className="modern-input" />
                            </div>
                            <button className="btn-save-modern" onClick={handleCreateStudent} disabled={!createForm.fullName || !createForm.email || !createForm.password || creating} style={{ height: '46px', marginTop: 'auto' }}>
                                {creating ? 'Creando...' : 'Crear Alumno'}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Existing Student Tab ── */}
                {activeTab === 'existing' && (
                    <div className="form-grid">
                        <h4 style={{ color: '#fff', margin: 0 }}>Agregar Alumno Existente</h4>
                        <input
                            type="text"
                            placeholder="Buscar por nombre o correo..."
                            className="modern-input"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ marginBottom: '1rem', width: '100%' }}
                            autoFocus
                        />
                        <div className="users-table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {loadingAll ? (
                                <p style={{ color: 'rgba(255,255,255,0.5)', padding: '20px', textAlign: 'center' }}>Cargando alumnos...</p>
                            ) : (
                                <table className="users-table">
                                    <thead>
                                        <tr><th>Nombre</th><th>Email</th><th>Acción</th></tr>
                                    </thead>
                                    <tbody>
                                        {filteredStudents.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                                                    {searchQuery ? 'Sin resultados para esa búsqueda.' : 'No hay alumnos registrados en la plataforma.'}
                                                </td>
                                            </tr>
                                        ) : filteredStudents.map(student => (
                                            <tr key={student.id}>
                                                <td>{student.name}</td>
                                                <td>{student.email}</td>
                                                <td>
                                                    <button
                                                        className="btn-save-modern"
                                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                                                        disabled={enrollingId === student.id}
                                                        onClick={() => handleEnrollExisting(student)}
                                                    >
                                                        {enrollingId === student.id ? 'Inscribiendo...' : 'Inscribir'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* ── CSV Tab ── */}
                {activeTab === 'csv' && (
                    <div className="csv-upload-subject">
                        <h4>Subir Archivo CSV</h4>
                        <div className="csv-helper-text">Formato requerido: <code>email, password, full_name, [cohort]</code></div>
                        <input type="file" accept=".csv" onChange={handleFileUpload} className="modern-input" style={{ maxWidth: '400px', margin: '0 auto' }} disabled={parsing || loading} />
                    </div>
                )}

                {/* ── Import Results ── */}
                {results && (
                    <div className="results-section">
                        <h3>📈 Resultados de Importación</h3>
                        <div className="results-summary">
                            <div className="result-item success"><span className="result-number">{results.success}</span><span className="result-label">Creados</span></div>
                            <div className="result-item error"><span className="result-number">{results.errors}</span><span className="result-label">Errores</span></div>
                        </div>
                        {results.errorDetails.length > 0 && (
                            <div className="errors-details">
                                <h4>❌ Errores Detallados:</h4>
                                <div className="error-list">
                                    {results.errorDetails.map((e, i) => (
                                        <div key={i} className="error-item"><strong>{e.email}</strong>: {e.error}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Enrolled Students List ── */}
                <div className="user-list-section">
                    <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: '2rem 0 1rem' }}>
                        📋 Lista de Alumnos Registrados ({loadingEnrolled ? '...' : enrolledStudents.length})
                    </h3>
                    <div className="users-table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Email</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingEnrolled ? (
                                    <tr><td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Cargando...</td></tr>
                                ) : enrolledStudents.length === 0 ? (
                                    <tr><td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>No hay alumnos inscritos en este grado.</td></tr>
                                ) : enrolledStudents.map(student => (
                                    <tr key={student.id}>
                                        <td>{student.name}</td>
                                        <td>{student.email}</td>
                                        <td style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {/* Link tutor button */}
                                            <button
                                                onClick={() => setTutorTarget(student)}
                                                style={{
                                                    background: 'rgba(99,102,241,0.15)',
                                                    color: '#a5b4fc',
                                                    border: '1px solid rgba(99,102,241,0.35)',
                                                    borderRadius: '6px',
                                                    padding: '4px 10px',
                                                    fontSize: '0.8rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.3)')}
                                                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.15)')}
                                            >
                                                🔗 Vincular Tutor
                                            </button>
                                            <button
                                                onClick={() => handleViewTutors(student)}
                                                style={{
                                                    background: 'rgba(99,102,241,0.15)',
                                                    color: '#a5b4fc',
                                                    border: '1px solid rgba(99,102,241,0.35)',
                                                    borderRadius: '6px',
                                                    padding: '4px 10px',
                                                    fontSize: '0.8rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.3)')}
                                                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.15)')}
                                            >
                                                📋 Ver Tutores
                                            </button>
                                            <button
                                                onClick={() => handleRemoveFromGrade(student)}
                                                className="action-btn delete"
                                                disabled={isDeleting === student.id}
                                            >
                                                {isDeleting === student.id ? '...' : 'Quitar'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </>
    )
}

export default StudentManagement
