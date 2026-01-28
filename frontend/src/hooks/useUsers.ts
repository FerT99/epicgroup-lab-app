import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Tipo para el usuario en la tabla pública
export interface PublicUser {
    id: string
    email: string
    full_name: string | null
    cohort: string | null
    avatar_url: string | null
    created_at: string
    updated_at: string
}

// Hook para manejar usuarios sincronizados
export const useUsers = () => {
    const [users, setUsers] = useState<PublicUser[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Obtener todos los usuarios
    const fetchUsers = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setUsers(data || [])
        } catch (err: any) {
            setError(err.message)
            console.error('Error fetching users:', err)
        } finally {
            setLoading(false)
        }
    }

    // Obtener usuarios por cohorte
    const fetchUsersByCohort = async (cohort: string) => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('cohort', cohort)
                .order('created_at', { ascending: false })

            if (error) throw error
            setUsers(data || [])
        } catch (err: any) {
            setError(err.message)
            console.error('Error fetching users by cohort:', err)
        } finally {
            setLoading(false)
        }
    }

    // Obtener un usuario específico
    const fetchUser = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) throw error
            return data
        } catch (err: any) {
            setError(err.message)
            console.error('Error fetching user:', err)
            return null
        }
    }

    // Actualizar perfil de usuario
    const updateUserProfile = async (userId: string, updates: Partial<PublicUser>) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
                .single()

            if (error) throw error

            // Actualizar también en auth.users
            const { error: authError } = await supabase.auth.updateUser({
                data: {
                    full_name: updates.full_name,
                    cohort: updates.cohort,
                    avatar_url: updates.avatar_url
                }
            })

            if (authError) throw authError

            // Actualizar el estado local
            setUsers(prev => prev.map(user =>
                user.id === userId ? { ...user, ...updates } : user
            ))

            return data
        } catch (err: any) {
            setError(err.message)
            console.error('Error updating user profile:', err)
            throw err
        }
    }

    // Obtener estadísticas de usuarios
    const getUserStats = () => {
        const total = users.length
        const byCohort = users.reduce((acc, user) => {
            const cohort = user.cohort || 'Sin cohorte'
            acc[cohort] = (acc[cohort] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        return {
            total,
            byCohort,
            recentUsers: users.slice(0, 5) // Últimos 5 usuarios
        }
    }

    // Suscribirse a cambios en tiempo real
    useEffect(() => {
        const channel = supabase
            .channel('users-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'users'
                },
                (payload) => {
                    console.log('Users table changed:', payload)

                    if (payload.eventType === 'INSERT') {
                        setUsers(prev => [payload.new as PublicUser, ...prev])
                    } else if (payload.eventType === 'UPDATE') {
                        setUsers(prev => prev.map(user =>
                            user.id === payload.new.id ? payload.new as PublicUser : user
                        ))
                    } else if (payload.eventType === 'DELETE') {
                        setUsers(prev => prev.filter(user => user.id !== payload.old.id))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    // Cargar usuarios al montar el componente
    useEffect(() => {
        fetchUsers()
    }, [])

    return {
        users,
        loading,
        error,
        fetchUsers,
        fetchUsersByCohort,
        fetchUser,
        updateUserProfile,
        getUserStats,
        refetch: fetchUsers
    }
}

// Hook específico para el usuario actual
export const useCurrentUser = () => {
    const [currentUser, setCurrentUser] = useState<PublicUser | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const getCurrentUser = async () => {
            try {
                setLoading(true)

                // Obtener el usuario autenticado
                const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
                if (authError) throw authError

                if (!authUser) {
                    setCurrentUser(null)
                    return
                }

                // Obtener datos del usuario desde la tabla pública
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', authUser.id)
                    .single()

                if (error) throw error
                setCurrentUser(data)
            } catch (err: any) {
                setError(err.message)
                console.error('Error getting current user:', err)
            } finally {
                setLoading(false)
            }
        }

        getCurrentUser()

        // Suscribirse a cambios de autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    await getCurrentUser()
                } else if (event === 'SIGNED_OUT') {
                    setCurrentUser(null)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    return {
        currentUser,
        loading,
        error
    }
}

// Hook para administrar usuarios (solo para admins)
export const useUserManagement = () => {
    const { users, loading, error, fetchUsers, fetchUsersByCohort, updateUserProfile } = useUsers()

    // Eliminar usuario (tanto de auth como de public)
    const deleteUser = async (userId: string) => {
        try {
            // Eliminar de auth.users (esto también eliminará de public.users por el trigger)
            const { error } = await supabase.auth.admin.deleteUser(userId)
            if (error) throw error

            // Actualizar estado local
            // Note: setUsers is not exposed from useUsers hook directly for modification this way, 
            // but the realtime subscription in useUsers should handle it. 
            // However, 'deleteUser' here just calls the API. 
            // The 'useUsers' hook will reflect changes via realtime or refetch.
            fetchUsers() // Force refresh just in case
        } catch (err: any) {
            console.error('Error deleting user:', err)
            throw err
        }
    }

    // Crear usuario (para admins)
    const createUser = async (userData: {
        email: string
        password: string
        full_name?: string
        cohort?: string
    }) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    data: {
                        full_name: userData.full_name,
                        cohort: userData.cohort
                    }
                }
            })

            if (error) throw error
            return data
        } catch (err: any) {
            console.error('Error creating user:', err)
            throw err
        }
    }

    return {
        users,
        loading,
        error,
        fetchUsers,
        fetchUsersByCohort,
        updateUserProfile,
        deleteUser,
        createUser
    }
}
