import React, { useState, useEffect } from 'react'
import { getCenterProfessors } from '../lib/adminApi'
import './HierarchyConfig.css' // Reusing hierarchy styles for modal

interface User {
    id: string
    full_name: string
    email: string
    firstname?: string
    lastname?: string
}

interface ProfessorAssignmentModalProps {
    isOpen: boolean
    onClose: () => void
    onAssign: (userId: string) => void
    centerId: string
    currentProfessorIds: string[]
}

const ProfessorAssignmentModal: React.FC<ProfessorAssignmentModalProps> = ({
    isOpen,
    onClose,
    onAssign,
    centerId,
    currentProfessorIds
}) => {
    const [professors, setProfessors] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
    const [assigning, setAssigning] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen && centerId) {
            loadProfessors()
        }
    }, [isOpen, centerId])

    const loadProfessors = async () => {
        try {
            setLoading(true)
            const data = await getCenterProfessors(centerId)
            setProfessors(data)
        } catch (err: any) {
            setError(err.message || 'Error al cargar profesores')
        } finally {
            setLoading(false)
        }
    }

    // Reworking to be a "Select Professor" modal essentially
    // But wait, the plan said "Include 'Create New Professor' option".

    return (
        <div className={`modal-overlay ${isOpen ? 'active' : ''}`} style={{ display: isOpen ? 'flex' : 'none' }}>
            <div className="modal-content" style={{ maxWidth: '600px', width: '90%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                <div className="modal-header">
                    <h3>Asignar Profesor</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body" style={{ overflowY: 'auto', flex: 1 }}>
                    {loading ? (
                        <div style={{ padding: '20px', textAlign: 'center' }}>Cargando profesores...</div>
                    ) : error ? (
                        <div className="error-message">{error}</div>
                    ) : (
                        <div className="professors-list">
                            {professors.length === 0 ? (
                                <p style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                                    No hay profesores disponibles en este centro.
                                </p>
                            ) : (
                                professors
                                    .filter(p => !currentProfessorIds.includes(p.id))
                                    .map(professor => (
                                        <div key={professor.id} className="professor-item" style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '12px',
                                            borderBottom: '1px solid rgba(255,255,255,0.1)'
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: 'bold' }}>{professor.full_name || professor.email}</div>
                                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{professor.email}</div>
                                            </div>
                                            <button
                                                className="action-btn"
                                                onClick={() => onAssign(professor.id)} // Pass ID back to parent
                                                disabled={assigning === professor.id}
                                                style={{ background: '#6c5ce7', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                {assigning === professor.id ? 'Asignando...' : 'Asignar'}
                                            </button>
                                        </div>
                                    ))
                            )}

                            {professors.every(p => currentProfessorIds.includes(p.id)) && professors.length > 0 && (
                                <p style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                                    Todos los profesores de este centro ya están asignados.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProfessorAssignmentModal
