import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { User } from '@supabase/supabase-js'
import TopNavigation from './TopNavigation'
import { getUserRole } from '../utils/getUserRole'
import { auth } from '../lib/supabase'
import {
    getSectionById,
    getCourseModules,
    createCourseModule,
    updateCourseModule,
    deleteCourseModule,
    createModuleItem,
    uploadModuleItem,
    updateModuleItem,
    deleteModuleItem,
    type Section,
    type CourseModule,
    type ModuleItem
} from '../lib/adminApi'
import './HierarchyConfig.css'

interface CourseContentScreenProps {
    user: User
}

const CourseContentScreen: React.FC<CourseContentScreenProps> = ({ user }) => {
    const { centerId, gradeId, courseId } = useParams<{ centerId: string, gradeId: string, courseId: string }>()
    const navigate = useNavigate()
    const userRole = getUserRole(user)

    const [section, setSection] = useState<Section | null>(null)
    const [modules, setModules] = useState<CourseModule[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Modals state
    const [showModuleModal, setShowModuleModal] = useState(false)
    const [showItemModal, setShowItemModal] = useState(false)
    const [editingModule, setEditingModule] = useState<CourseModule | null>(null)
    const [activeModuleId, setActiveModuleId] = useState<string | null>(null) // For adding item to specific module

    // Form states
    const [moduleForm, setModuleForm] = useState({ title: '' })
    const [itemForm, setItemForm] = useState<{
        type: 'pdf' | 'video' | 'link' | 'assignment',
        title: string,
        description: string,
        content_url: string
    }>({
        type: 'pdf',
        title: '',
        description: '',
        content_url: ''
    })

    useEffect(() => {
        if (courseId) {
            loadData()
        }
    }, [courseId])

    const loadData = async () => {
        if (!courseId) return
        try {
            setLoading(true)
            const [sectionData, modulesData] = await Promise.all([
                getSectionById(courseId),
                getCourseModules(courseId)
            ])
            setSection(sectionData)
            setModules(modulesData)
        } catch (err: any) {
            setError(err.message || 'Error al cargar datos del curso')
        } finally {
            setLoading(false)
        }
    }

    const handleNavigate = (path: string) => {
        navigate(path)
    }

    const handleLogout = async () => {
        await auth.signOut()
    }

    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    // Module Handlers
    const handleCreateModule = () => {
        setEditingModule(null)
        setModuleForm({ title: '' })
        setShowModuleModal(true)
    }

    const handleEditModule = (module: CourseModule) => {
        setEditingModule(module)
        setModuleForm({ title: module.title })
        setShowModuleModal(true)
    }

    const handleSaveModule = async () => {
        if (!courseId) return
        try {
            if (editingModule) {
                await updateCourseModule(editingModule.id, { title: moduleForm.title })
            } else {
                await createCourseModule(courseId, moduleForm.title, modules.length)
            }
            await loadData()
            setShowModuleModal(false)
        } catch (err: any) {
            alert(err.message || 'Error al guardar módulo')
        }
    }

    const handleDeleteModule = async (moduleId: string) => {
        if (!confirm('¿Estás seguro de eliminar este módulo y todo su contenido?')) return
        try {
            await deleteCourseModule(moduleId)
            await loadData()
        } catch (err: any) {
            alert(err.message || 'Error al eliminar módulo')
        }
    }

    // Item Handlers
    const handleAddItem = (moduleId: string) => {
        setActiveModuleId(moduleId)
        setItemForm({
            type: 'pdf',
            title: '',
            description: '',
            content_url: ''
        })
        setSelectedFile(null)
        setShowItemModal(true)
    }

    const handleSaveItem = async () => {
        if (!activeModuleId) return
        try {
            if (itemForm.type === 'pdf' && selectedFile) {
                // Handle file upload
                await uploadModuleItem(activeModuleId, selectedFile, {
                    title: itemForm.title,
                    description: itemForm.description,
                    order_index: 999
                })
            } else {
                // Handle regular item creation
                await createModuleItem(activeModuleId, {
                    ...itemForm,
                    order_index: 999
                })
            }

            await loadData()
            setShowItemModal(false)
        } catch (err: any) {
            alert(err.message || 'Error al guardar ítem')
        }
    }

    const handleDeleteItem = async (itemId: string) => {
        if (!confirm('¿Eliminar este elemento?')) return
        try {
            await deleteModuleItem(itemId)
            await loadData()
        } catch (err: any) {
            alert(err.message || 'Error al eliminar elemento')
        }
    }

    if (loading) {
        return <div className="loading-screen"><div className="loading-spinner"></div></div>
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

            <div className="hierarchy-config" style={{ padding: '2rem 4rem' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
                    {/* Header */}
                    <div className="modern-header-row" style={{ marginBottom: '2rem' }}>
                        <div className="header-action-left" style={{ width: '150px' }}>
                            <button
                                className="btn-back"
                                onClick={() => navigate(`/admin/school/${centerId}`)}
                            >
                                ← Volver
                            </button>
                        </div>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                            <h1 style={{ margin: 0, fontSize: '2rem', color: '#fff' }}>
                                {section?.name}
                            </h1>
                            <p style={{ color: '#aaa', marginTop: '0.5rem' }}>Contenido del Curso</p>
                        </div>
                        <div className="header-action-right" style={{ width: '150px', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                className="btn-icon"
                                onClick={() => navigate(`/admin/school/${centerId}/grade/${gradeId}/course/${courseId}/edit`)}
                                title="Configuración del Curso"
                                style={{ background: 'rgba(255,255,255,0.1)', padding: '0.8rem' }}
                            >
                                ⚙️
                            </button>
                            <button
                                className="btn-add"
                                onClick={handleCreateModule}
                            >
                                + Módulo
                            </button>
                        </div>
                    </div>

                    {/* Modules List */}
                    <div className="modules-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {modules.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem', color: '#666', border: '2px dashed #333', borderRadius: '1rem' }}>
                                <p>No hay módulos creados. Comienza agregando uno.</p>
                            </div>
                        ) : (
                            modules.map(module => (
                                <div key={module.id} style={{
                                    background: 'rgba(30, 30, 46, 0.8)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    overflow: 'hidden'
                                }}>
                                    {/* Module Header */}
                                    <div style={{
                                        padding: '1.5rem',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <h3 style={{ margin: 0, color: '#e879f9' }}>{module.title}</h3>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => handleEditModule(module)} className="btn-icon">✏️</button>
                                            <button onClick={() => handleDeleteModule(module.id)} className="btn-icon">🗑️</button>
                                        </div>
                                    </div>

                                    {/* Items List */}
                                    <div style={{ padding: '1rem' }}>
                                        {module.items && module.items.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {module.items.map(item => (
                                                    <div key={item.id} style={{
                                                        padding: '1rem',
                                                        background: 'rgba(0, 0, 0, 0.2)',
                                                        borderRadius: '8px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '1rem'
                                                    }}>
                                                        <div style={{ fontSize: '1.5rem' }}>
                                                            {item.type === 'pdf' ? '📄' : item.type === 'video' ? '🎥' : item.type === 'assignment' ? '📝' : '🔗'}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: 'bold' }}>{item.title}</div>
                                                            {item.description && <div style={{ fontSize: '0.85rem', color: '#888' }}>{item.description}</div>}
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            {item.content_url && (
                                                                <a href={item.content_url} target="_blank" rel="noopener noreferrer" className="btn-icon" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                                                                    ⬇️
                                                                </a>
                                                            )}
                                                            <button onClick={() => handleDeleteItem(item.id)} className="btn-icon">🗑️</button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p style={{ color: '#666', fontStyle: 'italic', padding: '1rem' }}>Sin contenido</p>
                                        )}

                                        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                                            <button
                                                onClick={() => handleAddItem(module.id)}
                                                style={{
                                                    background: 'transparent',
                                                    border: '1px dashed rgba(255,255,255,0.3)',
                                                    color: '#aaa',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                + Agregar contenido
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* MODULE MODAL */}
            {showModuleModal && (
                <div className="modal-overlay" onClick={() => setShowModuleModal(false)}>
                    <div className="school-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingModule ? 'Editar Módulo' : 'Nuevo Módulo'}</h2>
                        </div>
                        <div className="form-group">
                            <label>Nombre del Módulo (Ej: Tema 1)</label>
                            <input
                                type="text"
                                className="modern-input"
                                value={moduleForm.title}
                                onChange={e => setModuleForm({ ...moduleForm, title: e.target.value })}
                                autoFocus
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel-modern" onClick={() => setShowModuleModal(false)}>Cancelar</button>
                            <button className="btn-save-modern" onClick={handleSaveModule}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ITEM MODAL (MVP) */}
            {showItemModal && (
                <div className="modal-overlay" onClick={() => setShowItemModal(false)}>
                    <div className="school-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Agregar Contenido</h2>
                        </div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Tipo</label>
                                <select
                                    className="modern-input"
                                    value={itemForm.type}
                                    onChange={e => setItemForm({ ...itemForm, type: e.target.value as any })}
                                >
                                    <option value="pdf">Documento PDF</option>
                                    <option value="video">Video</option>
                                    <option value="link">Enlace</option>
                                    <option value="assignment">Tarea</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Título</label>
                                <input
                                    type="text"
                                    className="modern-input"
                                    value={itemForm.title}
                                    onChange={e => setItemForm({ ...itemForm, title: e.target.value })}
                                />
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label>Descripción</label>
                                <textarea
                                    className="modern-input"
                                    value={itemForm.description}
                                    onChange={e => setItemForm({ ...itemForm, description: e.target.value })}
                                />
                            </div>

                            {itemForm.type === 'pdf' ? (
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label>Archivo PDF</label>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        className="modern-input"
                                        onChange={e => {
                                            if (e.target.files && e.target.files[0]) {
                                                setSelectedFile(e.target.files[0])
                                                // Auto-set title if empty
                                                if (!itemForm.title) {
                                                    setItemForm({ ...itemForm, title: e.target.files[0].name.replace('.pdf', '') })
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label>URL del Contenido</label>
                                    <input
                                        type="text"
                                        className="modern-input"
                                        value={itemForm.content_url}
                                        onChange={e => setItemForm({ ...itemForm, content_url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                            )}
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel-modern" onClick={() => setShowItemModal(false)}>Cancelar</button>
                            <button className="btn-save-modern" onClick={handleSaveItem}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default CourseContentScreen
