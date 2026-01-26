import React, { useState, useEffect } from 'react'
import { getCenterProfessors, assignProfessor, unassignProfessor } from '../lib/adminApi'
import { PublicUser } from '../hooks/useUsers'
import { supabase } from '../lib/supabase'

interface TeacherManagementProps {
    centerId: string
    centerName?: string
}

const TeacherManagement: React.FC<TeacherManagementProps> = ({ centerId, centerName }) => {
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
            // 1. Create User in Supabase Auth
            // The trigger on public.users should handle the insertion into the table based on metadata
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: createForm.email,
                password: createForm.password,
                options: {
                    data: {
                        full_name: createForm.fullName,
                        username: createForm.email,
                        password: createForm.password, // Persist password as requested (be careful with security in prod)
                        firstname: createForm.fullName.split(' ')[0] || '',
                        lastname: createForm.fullName.split(' ').slice(1).join(' ') || '',
                        role: 'professor',
                        is_professor: true,
                        center_id: centerId, // Assign to this center directly in data if needed
                        status: 'active'
                    }
                }
            })

            if (authError) throw authError

            if (authData.user) {
                // 2. Assign to Center (Junction Table)
                await assignProfessor(centerId, authData.user.id)

                // 3. Reset and Refresh
                setCreateForm({ fullName: '', email: '', password: '' })
                await loadAssignedTeachers()
                alert('Maestro creado y asignado exitosamente')
            }

        } catch (err: any) {
            setError(err.message || 'Error al crear maestro')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="teacher-management">
            {error && (
                <div style={{
                    background: 'rgba(255, 77, 79, 0.1)',
                    border: '1px solid rgba(255, 77, 79, 0.2)',
                    color: '#ff4d4f',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    marginBottom: '1rem'
                }}>
                    {error}
                    <button onClick={() => setError(null)} style={{ float: 'right', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
                </div>
            )}

            {/* CREATE FORM - DIRECTLY VISIBLE */}
            <div className="create-form-container" style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                <h4 style={{ marginTop: 0, marginBottom: '1rem', color: '#d946ef' }}>Registrar Nuevo Maestro</h4>
                <div className="form-grid" style={{ display: 'grid', gap: '1rem' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nombre Completo *</label>
                        <input
                            type="text"
                            value={createForm.fullName}
                            onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                            placeholder="Ej: Juan Pérez"
                            className="modern-input"
                            style={{ width: '100%' }}
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Correo Electrónico *</label>
                        <input
                            type="email"
                            value={createForm.email}
                            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                            placeholder="ejemplo@escuela.com"
                            className="modern-input"
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Contraseña *</label>
                        <input
                            type="text"
                            value={createForm.password}
                            onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                            placeholder="Contraseña segura"
                            className="modern-input"
                            style={{ width: '100%' }}
                        />
                    </div>
                    <button
                        className="btn-save-modern"
                        onClick={handleCreateTeacher}
                        disabled={!createForm.fullName || !createForm.email || !createForm.password || loading}
                        style={{ marginTop: '0.5rem' }}
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

                {!loading && assignedTeachers.length === 0 && (
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>No hay maestros asignados a este colegio.</p>
                )}

                <div className="teachers-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {assignedTeachers.map(teacher => (
                        <div
                            key={teacher.id}
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                padding: '1rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: '#c084fc',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    color: '#fff'
                                }}>
                                    {(teacher.full_name || teacher.email).substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '600', color: '#fff' }}>{teacher.full_name || 'Maestro'}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>{teacher.email}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleUnassign(teacher.id)}
                                style={{
                                    background: 'rgba(255, 77, 79, 0.1)',
                                    color: '#ff4d4f',
                                    border: '1px solid rgba(255, 77, 79, 0.2)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s'
                                }}
                                className="btn-unassign"
                            >
                                Desasignar
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default TeacherManagement
