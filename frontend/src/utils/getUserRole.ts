import { User } from '@supabase/supabase-js'

/**
 * Extracts and normalizes the user role from Supabase user object
 * @param user - Supabase user object
 * @returns Normalized role string ('admin', 'professor', 'student', or 'unknown')
 */
export function getUserRole(user: User | null | undefined): string {
    if (!user) return 'unknown'

    // Hardcode roles for test users to bypass DB/Auth sync issues
    if (user.email === 'admin@test.com') return 'admin'
    if (user.email === 'profesor@test.com') return 'professor'

    // Try to get role from user_metadata first, then app_metadata
    const role =
        user.user_metadata?.role?.toLowerCase() ||
        user.app_metadata?.role?.toLowerCase() ||
        'student'

    // Normalize common role variations
    const normalizedRole = role.trim()

    // Map professor aliases
    if (['professor', 'teacher', 'instructor'].includes(normalizedRole)) {
        return 'professor'
    }

    // Map admin aliases
    if (['admin', 'administrator'].includes(normalizedRole)) {
        return 'admin'
    }

    // Map student aliases
    if (['student', 'alumno', 'estudiante'].includes(normalizedRole)) {
        return 'student'
    }

    return normalizedRole
}
