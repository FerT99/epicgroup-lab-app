import React, { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'
import './QuotesScreen.css'
import { auth } from '../lib/supabase'
import { getUserRole } from '../utils/getUserRole'
import TopNavigation from './TopNavigation'

interface QuotesScreenProps {
  user: User
}

const QuotesScreen: React.FC<QuotesScreenProps> = ({ user }) => {
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await auth.signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  // TODO: Fetch data from backend
  const columns: Array<{
    id: string
    tasks: Array<{ day: number; title: string; time: string; icon: string }>
    bottomTasks: Array<{ day: number; title: string; time: string; icon: string }>
  }> = []

  // TODO: Generate calendar dynamically from current date
  const calendarDays: string[][] = [
    ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  ]

  // TODO: Fetch selected days from backend
  const isSelected = (day: string) => false
  const isToday = (day: string) => false

  /* State for Task Modal */
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [taskForm, setTaskForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    description: ''
  })
  const [loading, setLoading] = useState(false)

  const handleCreateTask = () => {
    setTaskForm({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      description: ''
    })
    setShowTaskModal(true)
  }

  const handleSaveTask = async () => {
    setLoading(true)
    // TODO: Implement backend save logic
    console.log('Saving task:', taskForm)
    setTimeout(() => {
      setLoading(false)
      setShowTaskModal(false)
    }, 1000)
  }

  const displayName = user.user_metadata?.full_name || user.email || 'Usuario'
  const userRole = getUserRole(user)

  return (
    <div className="quotes-screen">
      <TopNavigation
        activeKey="quotes"
        userDisplayName={displayName}
        userRole={userRole}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        logoutLoading={isLoggingOut}
        notificationCount={0}
        onOpenNotifications={() => console.log('Abrir notificaciones')}
      />

      <div className="dashboard-content">
        {/* Sidebar Left */}
        <aside className="dashboard-sidebar">
          <div className="user-profile-header">
            <div className="user-avatar-circle"></div>
            <div className="user-info">
              <h2>{user.user_metadata?.full_name || user.email || 'Usuario'}</h2>
              <p>{user.user_metadata?.role || 'Usuario'}</p>
            </div>
          </div>

          <button className="create-task-btn" onClick={handleCreateTask}>
            CREATE NEW TASK
          </button>

          <div className="calendar-widget">
            <div className="calendar-header">
              <button>‹</button>
              <span>{new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()}</span>
              <button>›</button>
            </div>
            <div className="calendar-grid">
              {/* Header Row */}
              {calendarDays[0].map((d, i) => <div key={`h - ${i} `} className="cal-cell header">{d}</div>)}
              {/* Days */}
              {calendarDays.slice(1).map((week, wIndex) => (
                week.map((_day, dIndex) => (
                  <div
                    key={`${wIndex} -${dIndex} `}
                    className={`cal - cell day ${isSelected(_day) ? 'selected' : ''} ${isToday(_day) && wIndex === 0 ? 'range-start' : ''} `}
                  >
                    {_day}
                  </div>
                ))
              ))}
            </div>
          </div>

          <div className="month-tasks">
            <div className="month-tasks-header">
              <span>{new Date().toLocaleDateString('es-ES', { month: 'long' }).toUpperCase()} TASKS</span>
              <span>0 Total</span>
            </div>

            {/* TODO: Render tasks from backend */}
            <div className="empty-state">
              <p>No hay tareas para este mes</p>
            </div>
          </div>
        </aside>

        {/* Main Content Columns */}
        <main className="dashboard-main">
          {columns.length === 0 ? (
            <div className="empty-state-main">
              <p>No hay tareas programadas.</p>
            </div>
          ) : (
            columns.map((col) => (
              <div key={col.id} className="task-column">
                {/* Header Area */}
                <div className="column-header">
                  <h3>WEEKLY TASK</h3>
                  <p>{/* TODO: Dynamic date range */}</p>
                </div>

                {/* Ongoing Task Card */}
                <div className="ongoing-card">
                  <div className="ongoing-header">
                    <span>ONGOING TASK</span>
                    <div className="avatars">
                      {/* TODO: Dynamic avatars */}
                    </div>
                  </div>
                  <div className="ongoing-body">
                    <h4>{/* TODO: Dynamic task title */}</h4>
                  </div>
                </div>

                {/* Task List Group 1 */}
                <div className="task-list-group">
                  <span className="month-label">{/* TODO: Dynamic month */}</span>
                  {col.tasks.map((task, tIdx) => (
                    <div key={`t - ${tIdx} `} className="schedule-card">
                      <div className="schedule-date">
                        <span className="big-date">{task.day}</span>
                      </div>
                      <div className="schedule-details">
                        <h4>{task.title}</h4>
                        <p>{task.time}</p>
                      </div>
                      <div className="schedule-icon">
                        <div className="icon-circle">
                          <span className="bar-icon"></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Task List Group 2 */}
                <div className="task-list-group">
                  <span className="month-label">{/* TODO: Dynamic month */}</span>
                  {col.bottomTasks.map((task, tIdx) => (
                    <div key={`b - ${tIdx} `} className="schedule-card">
                      <div className="schedule-date">
                        <span className="big-date">{task.day}</span>
                      </div>
                      <div className="schedule-details">
                        <h4>{task.title}</h4>
                        <p>{task.time}</p>
                      </div>
                      <div className="schedule-icon">
                        <div className="icon-circle">
                          <span className="bar-icon"></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ))
          )}
        </main>
      </div>

      {/* Styled Modal for New Task */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="school-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">✨</div>
              <h2>Nueva Tarea</h2>
              <p>Programa una nueva actividad.</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Título *</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="Ej: Reunión de Padres"
                  className="modern-input"
                  autoFocus
                />
              </div>
              <div className="form-group-row" style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Fecha</label>
                  <input
                    type="date"
                    value={taskForm.date}
                    onChange={(e) => setTaskForm({ ...taskForm, date: e.target.value })}
                    className="modern-input"
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Hora</label>
                  <input
                    type="time"
                    value={taskForm.time}
                    onChange={(e) => setTaskForm({ ...taskForm, time: e.target.value })}
                    className="modern-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Detalles adicionales..."
                  className="modern-input"
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel-modern" onClick={() => setShowTaskModal(false)}>
                Cancelar
              </button>
              <button
                className="btn-save-modern"
                onClick={handleSaveTask}
                disabled={!taskForm.title || loading}
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuotesScreen
