import React, { useState, useEffect } from 'react'
import { getCenterProfessors, assignProfessor, unassignProfessor } from '../lib/adminApi'
import { PublicUser } from '../hooks/useUsers'
import './HierarchyConfig.css'

interface TeacherManagementProps {
    centerId: string
    centerName?: string
}

const TeacherManagement: React.FC<TeacherManagementProps> = ({ centerId }) => {
    const [assignedTeachers, setAssignedTeachers] = useState<PublicUser[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [createForm, setCreateForm] = useState({
        fullName: '',
        email: '',
        password: ''
    })

    useEffect(() => {
        loadAssignedTeachers()
    }, [centerId])

    const loadAssignedTeachers = async () => {
        try {
            setLoading(true)
            const data = await getCenterProfessors(centerId)
            setAssignedTeachers(data)
        } catch (err: any) {
            setError(err.message || 'Error al cargar profesores asignados')
        } finally {
            setLoading(false)
        }
    }

    const handleUnassign = async (userId: string) => {
        if (!confirm('¿Estás seguro de desasignar este profesor del colegio?')) return

        try {
            setLoading(true)
            await unassignProfessor(centerId, userId)
            await loadAssignedTeachers()
        } catch (err: any) {
            alert(err.message || 'Error al desasignar profesor')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateTeacher = async () => {
        try {
            setLoading(true)

            // Call Backend API to create user securely
            const response = await fetch('http://localhost:3001/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: createForm.email,
                    password: createForm.password,
                    fullName: createForm.fullName,
                    role: 'professor'
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error creando maestro')
            }

            // After creation, assign to center
            if (data.user && data.user.id) {
                await assignProfessor(centerId, data.user.id)
            }

            // Reset and Refresh
            setCreateForm({ fullName: '', email: '', password: '' })
            await loadAssignedTeachers()
            alert('Maestro creado y asignado exitosamente')

        } catch (err: any) {
            setError(err.message || 'Error al crear maestro')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="teacher-management">
            {error && (
                <div className="alert-box error" style={{ position: 'relative' }}>
                    {error}
                    <button
                        onClick={() => setError(null)}
                        style={{ position: 'absolute', right: '10px', top: '10px', background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* CREATE FORM */}
            <div className="form-grid" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h4 style={{ marginTop: 0, marginBottom: '1rem', color: '#d946ef' }}>Registrar Nuevo Maestro</h4>
                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                    <div className="form-group">
                        <label>Nombre Completo *</label>
                        <input
                            type="text"
                            value={createForm.fullName}
                            onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                            placeholder="Ej: Juan Pérez"
                            className="modern-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>Correo Electrónico *</label>
                        <input
                            type="email"
                            value={createForm.email}
                            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                            placeholder="ejemplo@escuela.com"
                            className="modern-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>Contraseña *</label>
                        <input
                            type="text"
                            value={createForm.password}
                            onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                            placeholder="Contraseña segura"
                            className="modern-input"
                        />
                    </div>
                    <button
                        className="btn-save-modern"
                        onClick={handleCreateTeacher}
                        disabled={!createForm.fullName || !createForm.email || !createForm.password || loading}
                        style={{ height: '46px', marginTop: 'auto' }}
                    >
                        {loading ? 'Creando...' : 'Crear y Asignar'}
                    </button>
                </div>
            </div>

            {/* List Section */}
            <div className="assigned-list">
                <h4 style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                    Maestros Asignados ({assignedTeachers.length})
                </h4>

                {loading && <p style={{ color: 'rgba(255,255,255,0.5)' }}>Cargando...</p>}

                <div className="users-table-container" style={{ maxHeight: '300px' }}>
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Avatar</th>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignedTeachers.map(teacher => (
                                <tr key={teacher.id}>
                                    <td style={{ width: '60px' }}>
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            background: '#c084fc',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            color: '#fff',
                                            fontSize: '0.9rem'
                                        }}>
                                            {(teacher.full_name || teacher.email || 'T').substring(0, 2).toUpperCase()}
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: '500' }}>{teacher.full_name || 'Maestro'}</td>
                                    <td style={{ color: 'rgba(255,255,255,0.7)' }}>{teacher.email}</td>
                                    <td>
                                        <button
                                            onClick={() => handleUnassign(teacher.id)}
                                            className="action-btn delete"
                                        >
                                            Desasignar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!loading && assignedTeachers.length === 0 && (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.5)' }}>
                                        No hay maestros asignados a este colegio.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default TeacherManagement
