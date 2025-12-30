import React, { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'
import './QuotesScreen.css'
import { auth } from '../lib/supabase'
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

  // Mock Data
  // Weekly tasks removed as they are now represented in 'columns'
  // More Mock Data for the 3 columns (repeating logic for visual matching)
  const columns = [
    {
      id: 'col1',
      tasks: [
        { day: 12, title: 'Startech Class', time: '09 AM - 10 AM', icon: 'bars' },
        { day: 12, title: 'English Class', time: '10 AM - 06 PM', icon: 'bars' },
      ],
      bottomTasks: [
        { day: 13, title: 'Review', time: '09 AM - 12 AM', icon: 'bars' },
        { day: 13, title: 'Class Game', time: '12 AM - 04 PM', icon: 'bars' },
        { day: 13, title: 'Califications', time: '04 PM - 06 PM', icon: 'bars' },
      ]
    },
    {
      id: 'col2',
      tasks: [
        { day: 12, title: 'Startech Class', time: '09 AM - 10 AM', icon: 'bars' },
        { day: 12, title: 'English Class', time: '10 AM - 06 PM', icon: 'bars' },
      ],
      bottomTasks: [
        { day: 13, title: 'Review', time: '09 AM - 12 AM', icon: 'bars' },
        { day: 13, title: 'Class Game', time: '12 AM - 04 PM', icon: 'bars' },
        { day: 13, title: 'Califications', time: '04 PM - 06 PM', icon: 'bars' },
      ]
    },
    {
      id: 'col3',
      tasks: [
        { day: 12, title: 'Startech Class', time: '09 AM - 10 AM', icon: 'bars' },
        { day: 12, title: 'English Class', time: '10 AM - 06 PM', icon: 'bars' },
      ],
      bottomTasks: [
        { day: 13, title: 'Review', time: '09 AM - 12 AM', icon: 'bars' },
        { day: 13, title: 'Class Game', time: '12 AM - 04 PM', icon: 'bars' },
        { day: 13, title: 'Califications', time: '04 PM - 06 PM', icon: 'bars' },
      ]
    }
  ]

  // Mock Calendar Grid
  const calendarDays = [
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    ['1', '2', '3', '4', '5', '6', '7'],
    ['8', '9', '10', '11', '12', '13', '14'],
    ['15', '16', '17', '18', '19', '20', '21'],
    ['22', '23', '24', '25', '26', '27', '28'],
    ['29', '30', '31', '1', '2', '3', '4']
  ]

  // Highlighted days for demo
  const isSelected = (day: string) => ['11', '12', '13', '16', '17', '18', '19', '24', '25'].includes(day)
  const isToday = (day: string) => day === '3' || day === '4' // Just distinct styling for some range start

  return (
    <div className="dashboard-screen">
      <TopNavigation
        activeKey="quotes" // Keeping 'quotes' active for now as per route
        userDisplayName={user.user_metadata?.full_name || user.email || 'Usuario'}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        logoutLoading={isLoggingOut}
        notificationCount={42}
        onOpenNotifications={() => console.log('Abrir notificaciones')}
      />

      <div className="dashboard-content">
        {/* Sidebar Left */}
        <aside className="dashboard-sidebar">
          <div className="user-profile-header">
            <div className="user-avatar-circle"></div>
            <div className="user-info">
              <h2>{user.user_metadata?.full_name || 'Raquel López'}</h2>
              <p>Epic Teacher</p>
            </div>
          </div>

          <button className="create-task-btn">
            CREATE NEW TASK
          </button>

          <div className="calendar-widget">
            <div className="calendar-header">
              <button>‹</button>
              <span>AUGUST 2020</span>
              <button>›</button>
            </div>
            <div className="calendar-grid">
              {/* Header Row */}
              {calendarDays[0].map((d, i) => <div key={`h-${i}`} className="cal-cell header">{d}</div>)}
              {/* Days */}
              {calendarDays.slice(1).map((week, wIndex) => (
                week.map((day, dIndex) => (
                  <div
                    key={`${wIndex}-${dIndex}`}
                    className={`cal-cell day ${isSelected(day) ? 'selected' : ''} ${isToday(day) && wIndex === 0 ? 'range-start' : ''}`}
                  >
                    {day}
                  </div>
                ))
              ))}
            </div>
          </div>

          <div className="month-tasks">
            <div className="month-tasks-header">
              <span>AUGUST TASKS</span>
              <span>4 Total</span>
            </div>

            <div className="task-item dark-card">
              <div className="task-info">
                <h4>JOB FAIR POSTER</h4>
                <p>3-4 August</p>
              </div>
              <button className="status-btn done">DONE</button>
            </div>

            <div className="task-item colored-card pink">
              <div className="task-info">
                <h4>INFOGRAPHIC</h4>
                <p>11-13 August</p>
              </div>
              <button className="status-btn view">VIEW</button>
            </div>

            <div className="task-item colored-card purple">
              <div className="task-info">
                <h4>MOBILE APP UI</h4>
                <p>18-19 August</p>
              </div>
              <button className="status-btn view">VIEW</button>
            </div>
          </div>
        </aside>

        {/* Main Content Columns */}
        <main className="dashboard-main">
          {columns.map((col) => (
            <div key={col.id} className="task-column">
              {/* Header Area */}
              <div className="column-header">
                <h3>WEEKLY TASK</h3>
                <p>9 August 2020 - 13 August 2020</p>
              </div>

              {/* Ongoing Task Card */}
              <div className="ongoing-card">
                <div className="ongoing-header">
                  <span>ONGOING TASK</span>
                  <div className="avatars">
                    <div className="avatar small"></div>
                    <div className="avatar small"></div>
                  </div>
                </div>
                <div className="ongoing-body">
                  <h4>Meeting with Team</h4>
                </div>
              </div>

              {/* Task List Group 1 */}
              <div className="task-list-group">
                <span className="month-label">AUGUST</span>
                {col.tasks.map((task, tIdx) => (
                  <div key={`t-${tIdx}`} className="schedule-card">
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
                <span className="month-label">AUGUST</span>
                {col.bottomTasks.map((task, tIdx) => (
                  <div key={`b-${tIdx}`} className="schedule-card">
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
          ))}
        </main>
      </div>
    </div>
  )
}

export default QuotesScreen
