import React, { useState, useEffect } from 'react'
import { useUsers, useCurrentUser, useUserManagement } from '../hooks/useUsers'
import './UserManagement.css'

// Componente para mostrar estadísticas de usuarios
export const UserStats: React.FC = () => {
  const { getUserStats } = useUsers()
  const stats = getUserStats()

  return (
    <div className="user-stats">
      <h2>📊 Estadísticas de Usuarios</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total de Usuarios</h3>
          <p className="stat-number">{stats.total}</p>
        </div>

        {Object.entries(stats.byCohort).map(([cohort, count]) => (
          <div key={cohort} className="stat-card">
            <h3>{cohort}</h3>
            <p className="stat-number">{count}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Componente para mostrar la lista de usuarios
export const UserList: React.FC = () => {
  const { users, loading, error, fetchUsersByCohort, fetchUsers } = useUsers()
  const [selectedCohort, setSelectedCohort] = useState<string>('all')

  const handleCohortFilter = (cohort: string) => {
    setSelectedCohort(cohort)
    if (cohort === 'all') {
      fetchUsers()
    } else {
      fetchUsersByCohort(cohort)
    }
  }

  if (loading) return <div className="loading">Cargando usuarios...</div>
  if (error) return <div className="error">Error: {error}</div>

  return (
    <div className="user-list">
      <h2>👥 Lista de Usuarios</h2>

      <div className="filter-buttons">
        <button
          className={selectedCohort === 'all' ? 'active' : ''}
          onClick={() => handleCohortFilter('all')}
        >
          Todos ({users.length})
        </button>
        <button
          className={selectedCohort === 'IPDC1' ? 'active' : ''}
          onClick={() => handleCohortFilter('IPDC1')}
        >
          IPDC1
        </button>
        <button
          className={selectedCohort === 'IPDC3' ? 'active' : ''}
          onClick={() => handleCohortFilter('IPDC3')}
        >
          IPDC3
        </button>
        <button
          className={selectedCohort === 'IPDC5' ? 'active' : ''}
          onClick={() => handleCohortFilter('IPDC5')}
        >
          IPDC5
        </button>
      </div>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Cohorte</th>
              <th>Fecha de Registro</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.full_name || 'Sin nombre'}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`cohort-badge ${user.cohort?.toLowerCase()}`}>
                    {user.cohort || 'Sin cohorte'}
                  </span>
                </td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Componente para el perfil del usuario actual
export const CurrentUserProfile: React.FC = () => {
  const { currentUser, loading, error } = useCurrentUser()
  const { updateUserProfile } = useUserManagement()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    cohort: '',
    avatar_url: ''
  })

  useEffect(() => {
    if (currentUser) {
      setFormData({
        full_name: currentUser.full_name || '',
        cohort: currentUser.cohort || '',
        avatar_url: currentUser.avatar_url || ''
      })
    }
  }, [currentUser])

  const handleSave = async () => {
    if (!currentUser) return

    try {
      await updateUserProfile(currentUser.id, formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  if (loading) return <div className="loading">Cargando perfil...</div>
  if (error) return <div className="error">Error: {error}</div>
  if (!currentUser) return <div className="error">No hay usuario autenticado</div>

  return (
    <div className="user-profile">
      <h2>👤 Mi Perfil</h2>

      <div className="profile-card">
        {isEditing ? (
          <div className="edit-form">
            <div className="form-group">
              <label>Nombre Completo:</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, full_name: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label>Cohorte:</label>
              <select
                value={formData.cohort}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, cohort: e.target.value }))}
              >
                <option value="">Seleccionar cohorte</option>
                <option value="IPDC1">IPDC1</option>
                <option value="IPDC3">IPDC3</option>
                <option value="IPDC5">IPDC5</option>
              </select>
            </div>

            <div className="form-group">
              <label>URL del Avatar:</label>
              <input
                type="url"
                value={formData.avatar_url}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, avatar_url: e.target.value }))}
              />
            </div>

            <div className="form-actions">
              <button onClick={handleSave} className="save-btn">Guardar</button>
              <button onClick={() => setIsEditing(false)} className="cancel-btn">Cancelar</button>
            </div>
          </div>
        ) : (
          <div className="profile-info">
            <div className="profile-field">
              <strong>Nombre:</strong> {currentUser.full_name || 'Sin especificar'}
            </div>
            <div className="profile-field">
              <strong>Email:</strong> {currentUser.email}
            </div>
            <div className="profile-field">
              <strong>Cohorte:</strong>
              <span className={`cohort-badge ${currentUser.cohort?.toLowerCase()}`}>
                {currentUser.cohort || 'Sin cohorte'}
              </span>
            </div>
            <div className="profile-field">
              <strong>Miembro desde:</strong> {new Date(currentUser.created_at).toLocaleDateString()}
            </div>

            <button onClick={() => setIsEditing(true)} className="edit-btn">
              ✏️ Editar Perfil
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Componente principal que combina todo
export const UserManagement: React.FC = () => {
  return (
    <div className="user-management">
      <h1>🔧 Gestión de Usuarios</h1>

      <div className="management-sections">
        <UserStats />
        <CurrentUserProfile />
        <UserList />
      </div>
    </div>
  )
}

export default UserManagement
