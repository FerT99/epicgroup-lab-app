import React, { useState, useEffect, useRef } from 'react'
import {
    getGradeContent,
    uploadGradeContent,
    deleteGradeContent,
    type GradeContent,
} from '../lib/adminApi'

interface ContentManagementProps {
    gradeId?: string
    gradeName?: string
}

const ContentManagement: React.FC<ContentManagementProps> = ({ gradeId, gradeName }) => {
    const [content, setContent] = useState<GradeContent[]>([])
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [dragActive, setDragActive] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (gradeId) {
            loadContent()
        }
    }, [gradeId])

    const loadContent = async () => {
        if (!gradeId) return

        try {
            setLoading(true)
            setError(null)
            const data = await getGradeContent(gradeId)
            setContent(data)
        } catch (err: any) {
            setError(err.message || 'Error al cargar contenido')
        } finally {
            setLoading(false)
        }
    }

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return

        const pdfFiles = Array.from(files).filter((file) => file.type === 'application/pdf')

        if (pdfFiles.length !== files.length) {
            setError('Solo se permiten archivos PDF')
        }

        if (pdfFiles.length > 10) {
            setError('Máximo 10 archivos por carga')
            return
        }

        const oversizedFiles = pdfFiles.filter((file) => file.size > 10 * 1024 * 1024)
        if (oversizedFiles.length > 0) {
            setError('Algunos archivos exceden el límite de 10MB')
            return
        }

        setSelectedFiles(pdfFiles)
        setError(null)
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files)
        }
    }

    const handleUpload = async () => {
        if (!gradeId || selectedFiles.length === 0) return

        try {
            setUploading(true)
            setError(null)
            await uploadGradeContent(gradeId, selectedFiles)
            setSelectedFiles([])
            await loadContent()
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        } catch (err: any) {
            setError(err.message || 'Error al subir archivos')
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (contentId: string) => {
        if (!confirm('¿Estás seguro de eliminar este contenido?')) return

        try {
            setLoading(true)
            await deleteGradeContent(contentId)
            await loadContent()
        } catch (err: any) {
            setError(err.message || 'Error al eliminar contenido')
        } finally {
            setLoading(false)
        }
    }

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString)
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    if (!gradeId) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                <p>Selecciona un grado para gestionar su contenido</p>
            </div>
        )
    }

    return (
        <div style={{ padding: '1rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>
                    Contenido de {gradeName || 'Grado'}
                </h3>
                <p style={{ color: '#888', fontSize: '0.9rem' }}>
                    Sube archivos PDF educativos para este grado
                </p>
            </div>

            {/* Error Banner */}
            {error && (
                <div
                    style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        padding: '0.75rem 1rem',
                        marginBottom: '1rem',
                        color: '#ef4444',
                        fontSize: '0.9rem',
                    }}
                >
                    ❌ {error}
                </div>
            )}

            {/* Upload Section */}
            <div
                style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: dragActive
                        ? '2px dashed #60a5fa'
                        : '2px dashed rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '2rem',
                    marginBottom: '2rem',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
                <p style={{ color: '#fff', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Arrastra archivos PDF aquí o haz clic para seleccionar
                </p>
                <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    Máximo 10 archivos, 10MB cada uno
                </p>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    multiple
                    onChange={(e) => handleFileSelect(e.target.files)}
                    style={{ display: 'none' }}
                />

                <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: '#fff',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                    Seleccionar Archivos
                </button>

                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                    <div style={{ marginTop: '1.5rem' }}>
                        <p style={{ color: '#fff', marginBottom: '0.75rem', fontWeight: '500' }}>
                            {selectedFiles.length} archivo(s) seleccionado(s):
                        </p>
                        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                            {selectedFiles.map((file, index) => (
                                <div
                                    key={index}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '6px',
                                        marginBottom: '0.5rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        fontSize: '0.85rem',
                                    }}
                                >
                                    <span style={{ color: '#fff' }}>{file.name}</span>
                                    <span style={{ color: '#888' }}>{formatFileSize(file.size)}</span>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            style={{
                                background: uploading
                                    ? '#555'
                                    : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                color: '#fff',
                                border: 'none',
                                padding: '0.75rem 2rem',
                                borderRadius: '8px',
                                cursor: uploading ? 'not-allowed' : 'pointer',
                                fontSize: '0.95rem',
                                fontWeight: '500',
                                marginTop: '1rem',
                            }}
                        >
                            {uploading ? 'Subiendo...' : 'Subir Archivos'}
                        </button>
                    </div>
                )}
            </div>

            {/* Content List */}
            <div>
                <h4 style={{ color: '#fff', marginBottom: '1rem' }}>
                    Contenido Disponible ({content.length})
                </h4>

                {loading && content.length === 0 ? (
                    <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>
                        Cargando contenido...
                    </p>
                ) : content.length === 0 ? (
                    <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>
                        No hay contenido disponible. Sube archivos para comenzar.
                    </p>
                ) : (
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {content.map((item) => (
                            <div
                                key={item.id}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '10px',
                                    padding: '1rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ fontSize: '1.5rem' }}>📄</span>
                                        <div>
                                            <h5 style={{ color: '#fff', margin: 0, marginBottom: '0.25rem' }}>
                                                {item.title}
                                            </h5>
                                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#888' }}>
                                                <span>{item.file_name}</span>
                                                <span>{formatFileSize(item.file_size)}</span>
                                                <span>{formatDate(item.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {item.download_url && (
                                        <a
                                            href={item.download_url}
                                            download={item.file_name}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                background: 'rgba(59, 130, 246, 0.2)',
                                                color: '#60a5fa',
                                                border: 'none',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                textDecoration: 'none',
                                                display: 'inline-block',
                                            }}
                                        >
                                            ⬇️ Descargar
                                        </a>
                                    )}
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.2)',
                                            color: '#ef4444',
                                            border: 'none',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                        }}
                                    >
                                        🗑️ Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ContentManagement
