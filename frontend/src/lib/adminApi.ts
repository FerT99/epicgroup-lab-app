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
    short_name?: string
    description?: string
    start_date?: string
    end_date?: string
    course_id?: string
    visibility?: 'active' | 'hidden' | 'archived'
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

export interface GradeContent {
    id: string
    grade_id: string
    title: string
    description?: string
    file_name: string
    file_path: string
    file_size: number
    uploaded_by?: string
    created_at: string
    updated_at: string
    is_active: boolean
    download_url?: string
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

export const getGradeById = async (id: string): Promise<GradeLevel> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/grades/${id}`)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        return await response.json()
    } catch (error) {
        console.error('Error fetching grade:', error)
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

export const getSectionById = async (id: string): Promise<Section> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/sections/${id}`)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        return await response.json()
    } catch (error) {
        console.error('Error fetching section:', error)
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

// ============================================
// SECTION PROFESSORS
// ============================================

export const getSectionProfessors = async (sectionId: string): Promise<any[]> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/sections/${sectionId}/professors`)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        return await response.json()
    } catch (error) {
        console.error('Error fetching section professors:', error)
        throw error
    }
}

export const assignSectionProfessor = async (sectionId: string, userId: string): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/sections/${sectionId}/professors`, {
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
        console.error('Error assigning professor to section:', error)
        throw error
    }
}

export const unassignSectionProfessor = async (sectionId: string, userId: string): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/sections/${sectionId}/professors/${userId}`, {
            method: 'DELETE',
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    } catch (error) {
        console.error('Error unassigning professor from section:', error)
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

// ============================================
// GRADE CONTENT
// ============================================

export const getGradeContent = async (gradeId: string): Promise<GradeContent[]> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/grades/${gradeId}/content`)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        return await response.json()
    } catch (error) {
        console.error('Error fetching grade content:', error)
        throw error
    }
}

export const uploadGradeContent = async (
    gradeId: string,
    files: File[],
    titles?: string[]
): Promise<GradeContent[]> => {
    try {
        const formData = new FormData()

        files.forEach((file) => {
            formData.append('files', file)
        })

        if (titles && titles.length > 0) {
            formData.append('titles', JSON.stringify(titles))
        }

        const response = await fetch(`${API_URL}/api/admin/grades/${gradeId}/content`, {
            method: 'POST',
            body: formData,
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        return result.content || []
    } catch (error) {
        console.error('Error uploading content:', error)
        throw error
    }
}

export const deleteGradeContent = async (contentId: string): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/content/${contentId}`, {
            method: 'DELETE',
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    } catch (error) {
        console.error('Error deleting content:', error)
        throw error
    }
}

export const getContentDownloadUrl = async (contentId: string): Promise<string> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/content/${contentId}/download-url`)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const data = await response.json()
        return data.download_url
    } catch (error) {
        console.error('Error getting download URL:', error)
        throw error
    }
}

// ============================================
// COURSE MODULES & ITEMS
// ============================================

export interface ModuleItem {
    id: string
    module_id: string
    type: 'pdf' | 'video' | 'link' | 'assignment'
    title: string
    description?: string
    content_url?: string
    order_index: number
    is_visible: boolean
    created_at: string
    updated_at: string
}

export interface CourseModule {
    id: string
    section_id: string
    title: string
    order_index: number
    is_active: boolean
    created_at: string
    updated_at: string
    items: ModuleItem[]
}

// MODULES

export const getCourseModules = async (sectionId: string): Promise<CourseModule[]> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/sections/${sectionId}/modules`)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        return await response.json()
    } catch (error) {
        console.error('Error fetching course modules:', error)
        throw error
    }
}

export const createCourseModule = async (sectionId: string, title: string, order_index: number = 0): Promise<CourseModule> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/sections/${sectionId}/modules`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, order_index }),
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        return await response.json()
    } catch (error) {
        console.error('Error creating module:', error)
        throw error
    }
}

export const updateCourseModule = async (id: string, data: Partial<CourseModule>): Promise<CourseModule> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/modules/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        return await response.json()
    } catch (error) {
        console.error('Error updating module:', error)
        throw error
    }
}

export const deleteCourseModule = async (id: string): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/modules/${id}`, {
            method: 'DELETE',
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    } catch (error) {
        console.error('Error deleting module:', error)
        throw error
    }
}

// ITEMS

export const createModuleItem = async (
    moduleId: string,
    data: Partial<ModuleItem>
): Promise<ModuleItem> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/modules/${moduleId}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        return await response.json()
    } catch (error) {
        console.error('Error creating item:', error)
        throw error
    }
}

export const uploadModuleItem = async (
    moduleId: string,
    file: File,
    data: { title: string, description?: string, order_index?: number }
): Promise<ModuleItem> => {
    try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('title', data.title)
        if (data.description) formData.append('description', data.description)
        if (data.order_index) formData.append('order_index', data.order_index.toString())

        const response = await fetch(`${API_URL}/api/admin/modules/${moduleId}/items/upload`, {
            method: 'POST',
            body: formData,
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Error uploading item:', error)
        throw error
    }
}

export const updateModuleItem = async (
    id: string,
    data: Partial<ModuleItem>
): Promise<ModuleItem> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/items/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        return await response.json()
    } catch (error) {
        console.error('Error updating item:', error)
        throw error
    }
}

export const deleteModuleItem = async (id: string): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/api/admin/items/${id}`, {
            method: 'DELETE',
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    } catch (error) {
        console.error('Error deleting item:', error)
        throw error
    }
}
