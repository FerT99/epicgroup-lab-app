import React from 'react'
import { useNavigate } from 'react-router-dom'
import { User } from '@supabase/supabase-js'
import Sidebar from './Sidebar'
import './CoursesScreen.css'
import appmobile02 from '../assets/APPMOBILE-02.png'
import appmobile03 from '../assets/APPMOBILE-03.png'
import appmobile04 from '../assets/APPMOBILE-04.png'

interface CoursesScreenProps {
  user: User
}

const CoursesScreen: React.FC<CoursesScreenProps> = ({ user }) => {
  const navigate = useNavigate()

  return (
    <div className="courses-screen">
      <Sidebar isCollapsed={false} />
      
      <div className="main-content">
        <div className="content-header">
          <div className="user-menu">
            <div className="user-avatar">
              <span className="avatar-text">
                {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </span>
            </div>
            <span className="user-email">{user.email}</span>
            <button className="logout-btn" onClick={() => navigate('/login')}>
              Cerrar Sesión
            </button>
          </div>
        </div>
        
        <div className="courses-content">
          <div className="welcome-section">
            <h2 className="welcome-title">¡Hola! {user.user_metadata?.full_name || 'Usuario'}</h2>
            <p className="welcome-subtitle">Explora tus cursos disponibles</p>
          </div>

          <div className="search-section">
            <div className="search-bar">
              <div className="search-icon">🔍</div>
              <input type="text" placeholder="Buscar cursos..." className="search-input" />
              <div className="filter-icon">⚙️</div>
            </div>
          </div>

          <div className="tabs-section">
            <div className="tab active">Mis cursos</div>
            <div className="tab">Frases del día</div>
            <div className="tab">Recordatorios</div>
          </div>

          <div className="courses-grid">
            <div className="course-card" onClick={() => navigate('/course/negocios')}>
              <div className="course-image">
                <img src={appmobile02} alt="Negocios" className="course-icon-image" />
              </div>
              <div className="course-info">
                <h4 className="course-name">Negocios</h4>
                <p className="course-description">Desarrollo empresarial</p>
                <div className="course-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '60%'}}></div>
                  </div>
                  <span className="progress-text">60%</span>
                </div>
              </div>
            </div>

            <div className="course-card" onClick={() => navigate('/course/new-startech')}>
              <div className="course-image">
                <img src={appmobile03} alt="New Startech" className="course-icon-image" />
              </div>
              <div className="course-info">
                <h4 className="course-name">New Startech</h4>
                <p className="course-description">Tecnología moderna</p>
                <div className="course-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '80%'}}></div>
                  </div>
                  <span className="progress-text">80%</span>
                </div>
              </div>
            </div>

            <div className="course-card" onClick={() => navigate('/course/ingles')}>
              <div className="course-image">
                <img src={appmobile04} alt="Inglés" className="course-icon-image" />
              </div>
              <div className="course-info">
                <h4 className="course-name">Inglés</h4>
                <p className="course-description">Idioma inglés</p>
                <div className="course-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '45%'}}></div>
                  </div>
                  <span className="progress-text">45%</span>
                </div>
              </div>
            </div>

            <div className="course-card" onClick={() => navigate('/course/desarrollo-web')}>
              <div className="course-image">
                <img src={appmobile02} alt="Desarrollo Web" className="course-icon-image" />
              </div>
              <div className="course-info">
                <h4 className="course-name">Desarrollo Web</h4>
                <p className="course-description">HTML, CSS y JavaScript</p>
                <div className="course-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '75%'}}></div>
                  </div>
                  <span className="progress-text">75%</span>
                </div>
              </div>
            </div>

            <div className="course-card" onClick={() => navigate('/course/react-native')}>
              <div className="course-image">
                <img src={appmobile03} alt="React Native" className="course-icon-image" />
              </div>
              <div className="course-info">
                <h4 className="course-name">React Native</h4>
                <p className="course-description">Desarrollo móvil</p>
                <div className="course-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '30%'}}></div>
                  </div>
                  <span className="progress-text">30%</span>
                </div>
              </div>
            </div>

            <div className="course-card" onClick={() => navigate('/course/python')}>
              <div className="course-image">
                <img src={appmobile04} alt="Python" className="course-icon-image" />
              </div>
              <div className="course-info">
                <h4 className="course-name">Python</h4>
                <p className="course-description">Programación básica</p>
                <div className="course-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '90%'}}></div>
                  </div>
                  <span className="progress-text">90%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoursesScreen
