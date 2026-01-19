import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export interface StudentData {
    id: string
    name: string
    email: string
    avatar?: string
    courses: Array<{
        id: number
        name: string
        progress: number
        color: string
    }>
    grades: Array<{
        courseName: string
        grade: number
        maxGrade: number
        assignmentName?: string
        gradedAt?: string
    }>
    comments: Array<{
        id: number
        text: string
        author: string
        date: string
    }>
}

export interface Student {
    id: number
    userId: string
    name: string
    email: string
    description: string
    color: string
}

export interface Comment {
    id: number
    text: string
    author: string
    date: string
}

/**
 * Fetch student progress data
 */
export const getStudentProgress = async (studentId: string): Promise<StudentData> => {
    try {
        const response = await fetch(`${API_URL}/api/students/${studentId}/progress`)

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error fetching student progress:', error)
        throw error
    }
}

/**
 * Fetch all students for a professor
 */
export const getStudentsByProfessor = async (professorId: string): Promise<Student[]> => {
    try {
        const response = await fetch(`${API_URL}/api/students?professorId=${professorId}`)

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error fetching students:', error)
        throw error
    }
}

/**
 * Add a comment to a student
 */
export const addStudentComment = async (
    studentId: string,
    text: string,
    professorId: string,
    authorName: string
): Promise<Comment> => {
    try {
        const response = await fetch(`${API_URL}/api/students/${studentId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text,
                professorId,
                authorName,
            }),
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error adding comment:', error)
        throw error
    }
}

/**
 * Update a comment
 */
export const updateComment = async (
    commentId: number,
    text: string,
    professorId: string
): Promise<Comment> => {
    try {
        const response = await fetch(`${API_URL}/api/comments/${commentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text,
                professorId,
            }),
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error updating comment:', error)
        throw error
    }
}

/**
 * Delete a comment
 */
export const deleteComment = async (
    commentId: number,
    professorId: string
): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/api/comments/${commentId}?professorId=${professorId}`, {
            method: 'DELETE',
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
    } catch (error) {
        console.error('Error deleting comment:', error)
        throw error
    }
}

/**
 * Get current user from Supabase
 */
export const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

/**
 * Get professor's courses
 */
export const getProfessorCourses = async (professorId: string) => {
    try {
        const response = await fetch(`${API_URL}/api/professors/${professorId}/courses`)

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error fetching professor courses:', error)
        throw error
    }
}
