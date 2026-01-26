const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// ============================================
// TYPES
// ============================================

export interface EducationalCenter {
    id: string
    name: string
    address?: string
    phone?: string
    email?: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface GradeLevel {
    id: string
    center_id: string
    name: string
    level?: number
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface Section {
    id: string
    grade_id: string
    name: string
    max_students: number
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface Subject {
    id: string
    section_id: string
    name: string
    description?: string
    hours_per_week: number
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface Hierarchy {
    center: EducationalCenter
    grades: (GradeLevel & {
        sections: (Section & {
            subjects: Subject[]
        })[]
    })[]
}

// ============================================
// EDUCATIONAL CENTERS
// ============================================

export const getCenters = async (): Promise<EducationalCenter[]> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/centers`)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        return await response.json()
    } catch (error) {
        console.error('Error fetching centers:', error)
        throw error
    }
}

export const getCenterById = async (id: string): Promise<EducationalCenter> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/centers/${id}`)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        return await response.json()
    } catch (error) {
        console.error('Error fetching center:', error)
        throw error
    }
}

export const createCenter = async (
    data: Partial<EducationalCenter>
): Promise<EducationalCenter> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/centers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        return await response.json()
    } catch (error) {
        console.error('Error creating center:', error)
        throw error
    }
}

export const updateCenter = async (
    id: string,
    data: Partial<EducationalCenter>
): Promise<EducationalCenter> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/centers/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        return await response.json()
    } catch (error) {
        console.error('Error updating center:', error)
        throw error
    }
}

export const deleteCenter = async (id: string): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/centers/${id}`, {
            method: 'DELETE',
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    } catch (error) {
        console.error('Error deleting center:', error)
        throw error
    }
}

// ============================================
// CENTER PROFESSORS
// ============================================

export const getCenterProfessors = async (centerId: string): Promise<any[]> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/centers/${centerId}/professors`)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        return await response.json()
    } catch (error) {
        console.error('Error fetching center professors:', error)
        throw error
    }
}

export const assignProfessor = async (centerId: string, userId: string): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/centers/${centerId}/professors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
        })
        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        }
        return await response.json()
    } catch (error) {
        console.error('Error assigning professor:', error)
        throw error
    }
}

export const unassignProfessor = async (centerId: string, userId: string): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/centers/${centerId}/professors/${userId}`, {
            method: 'DELETE',
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    } catch (error) {
        console.error('Error unassigning professor:', error)
        throw error
    }
}

// ============================================
// GRADES
// ============================================

export const getGradesByCenter = async (centerId: string): Promise<GradeLevel[]> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/centers/${centerId}/grades`)
        if (!response.ok) {
            const errorBody = await response.text()
            throw new Error(`HTTP error! status: ${response.status} - ${errorBody}`)
        }
        return await response.json()
    } catch (error) {
        console.error('Error fetching grades:', error)
        throw error
    }
}

export const createGrade = async (
    data: Partial<GradeLevel>
): Promise<GradeLevel> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/grades`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        return await response.json()
    } catch (error) {
        console.error('Error creating grade:', error)
        throw error
    }
}

export const updateGrade = async (
    id: string,
    data: Partial<GradeLevel>
): Promise<GradeLevel> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/grades/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        return await response.json()
    } catch (error) {
        console.error('Error updating grade:', error)
        throw error
    }
}

export const deleteGrade = async (id: string): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/grades/${id}`, {
            method: 'DELETE',
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    } catch (error) {
        console.error('Error deleting grade:', error)
        throw error
    }
}

// ============================================
// SECTIONS
// ============================================

export const getSectionsByGrade = async (gradeId: string): Promise<Section[]> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/grades/${gradeId}/sections`)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        return await response.json()
    } catch (error) {
        console.error('Error fetching sections:', error)
        throw error
    }
}

export const createSection = async (
    data: Partial<Section>
): Promise<Section> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/sections`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        return await response.json()
    } catch (error) {
        console.error('Error creating section:', error)
        throw error
    }
}

export const updateSection = async (
    id: string,
    data: Partial<Section>
): Promise<Section> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/sections/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        return await response.json()
    } catch (error) {
        console.error('Error updating section:', error)
        throw error
    }
}

export const deleteSection = async (id: string): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/sections/${id}`, {
            method: 'DELETE',
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    } catch (error) {
        console.error('Error deleting section:', error)
        throw error
    }
}

// ============================================
// SUBJECTS
// ============================================

export const getSubjectsBySection = async (sectionId: string): Promise<Subject[]> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/sections/${sectionId}/subjects`)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        return await response.json()
    } catch (error) {
        console.error('Error fetching subjects:', error)
        throw error
    }
}

export const createSubject = async (
    data: Partial<Subject>
): Promise<Subject> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/subjects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        return await response.json()
    } catch (error) {
        console.error('Error creating subject:', error)
        throw error
    }
}

export const updateSubject = async (
    id: string,
    data: Partial<Subject>
): Promise<Subject> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/subjects/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        return await response.json()
    } catch (error) {
        console.error('Error updating subject:', error)
        throw error
    }
}

export const deleteSubject = async (id: string): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/subjects/${id}`, {
            method: 'DELETE',
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    } catch (error) {
        console.error('Error deleting subject:', error)
        throw error
    }
}

// ============================================
// HIERARCHY
// ============================================

export const getHierarchy = async (centerId: string): Promise<Hierarchy> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/centers/${centerId}/hierarchy`)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        return await response.json()
    } catch (error) {
        console.error('Error fetching hierarchy:', error)
        throw error
    }
}
