import React, { useState, useEffect, useRef } from 'react'
import {
    getGradesByCenter,
    uploadGradeContent,
    type GradeLevel
} from '../lib/adminApi'

interface CenterContentUploadProps {
    centerId: string
    centerName: string
    onClose: () => void
}

const CenterContentUpload: React.FC<CenterContentUploadProps> = ({ centerId, centerName, onClose }) => {
    const [grades, setGrades] = useState<GradeLevel[]>([])
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [dragActive, setDragActive] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (centerId) {
            loadGrades()
        }
    }, [centerId])

    const loadGrades = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await getGradesByCenter(centerId)
            setGrades(data)
        } catch (err: any) {
            setError(err.message || 'Error al cargar los grados del centro')
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
        setSuccess(false)
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
        if (!centerId || selectedFiles.length === 0) return
        
        if (grades.length === 0) {
            setError('Este centro no tiene grados registrados. No se puede asignar contenido.')
            return
        }

        try {
            setUploading(true)
            setError(null)
            setSuccess(false)

            // Upload files to ALL grades sequentially to avoid overwhelming the server
            for (const grade of grades) {
                await uploadGradeContent(grade.id, selectedFiles)
            }

            setSelectedFiles([])
            setSuccess(true)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        } catch (err: any) {
            setError(err.message || 'Error al subir archivos')
        } finally {
            setUploading(false)
        }
    }

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Cargando información del centro...</div>
    }

    return (
        <div style={{ padding: '1rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <h3 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
                    Cargar PDFs a {centerName}
                </h3>
                <p style={{ color: '#888', fontSize: '0.95rem' }}>
                    Sube archivos PDF. Se asignarán automáticamente a los {grades.length} grados de este centro.
                </p>
            </div>

            {/* Error / Success Banners */}
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
            
            {success && (
                <div
                    style={{
                        background: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        borderRadius: '8px',
                        padding: '0.75rem 1rem',
                        marginBottom: '1rem',
                        color: '#4ade80',
                        fontSize: '0.9rem',
                    }}
                >
                    ✅ Archivos asignados correctamente a todos los grados del centro.
                </div>
            )}

            {/* Upload Subject */}
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
                    cursor: 'pointer'
                }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
                <p style={{ color: '#fff', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Arrastra archivos PDF aquí o haz clic para seleccionar
                </p>
                <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    Máximo 10 archivos simultáneos (10MB cada uno)
                </p>

                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileSelect(e.target.files)}
                />

                {selectedFiles.length > 0 && (
                    <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
                        <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>
                            Archivos seleccionados ({selectedFiles.length}):
                        </h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {selectedFiles.map((file, index) => (
                                <li
                                    key={index}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        color: '#cbd5e1',
                                        fontSize: '0.9rem',
                                    }}
                                >
                                    <span style={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        maxWidth: '80%'
                                    }}>
                                        {file.name}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedFiles(files => files.filter((_, i) => i !== index));
                                        }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            padding: '4px'
                                        }}
                                        disabled={uploading}
                                    >
                                        ✕
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                    onClick={onClose}
                    className="btn-cancel-modern"
                    disabled={uploading}
                >
                    Cerrar
                </button>
                <button
                    className="btn-save-modern"
                    onClick={handleUpload}
                    disabled={selectedFiles.length === 0 || uploading || grades.length === 0}
                    style={{
                        opacity: (selectedFiles.length === 0 || uploading || grades.length === 0) ? 0.5 : 1,
                        cursor: (selectedFiles.length === 0 || uploading || grades.length === 0) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {uploading ? 'Subiendo...' : 'Subir y Asignar a Centro'}
                </button>
            </div>
        </div>
    )
}

export default CenterContentUpload
