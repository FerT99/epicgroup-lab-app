import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import epicLogo from '../assets/epic_.png';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    // Simple responsive adjustment for path
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogin = () => {
        navigate('/login');
    };

    return (
        <div className="landing-container">
            <button className="top-login-btn" onClick={handleLogin}>
                INICIAR SESIÓN
            </button>
            <header className="landing-header">
                <div className="main-tagline">
                    <h1>EPICGROUP LAB</h1>
                    <span className="subtitle">innovación educativa</span>
                </div>
                <p className="description">
                    Así transformamos espacios educativos en laboratorios de aprendizaje innovador.
                </p>
            </header>

            <div className="path-container">

                {/* SVG Winding Path - Only visible on Desktop/Tablet */}
                {!isMobile && (
                    <div className="svg-background">
                        <svg viewBox="0 0 1000 1200" preserveAspectRatio="xMidYMid meet" className="road-svg">
                            {/* 
                                Spiral Path Logic based on image:
                                Start (Mid-Left) -> Up/Right (P1) -> Right (P2) -> Down (P3) -> 
                                Left/Down (P4) -> Left/Up (P5) -> Center (Meta)
                            */}
                            {/* Disordered Background Spiral */}
                            <path
                                d="M -50 200
                                   C 100 0, 400 -50, 600 150
                                   S 900 600, 950 200
                                   S 1200 0, 1000 500
                                   S 600 400, 300 600
                                   S -100 900, 200 1000
                                   S 800 1300, 900 800
                                   S 1100 500, 700 900
                                   S 200 1200, 100 800
                                   S 500 500, 700 200"
                                fill="none"
                                stroke="#FFC0CB"
                                strokeWidth="80"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="road-path-disordered"
                            />

                            {/* Backdrop Path (Lighter Pink, Wider) */}
                            <path
                                d="M 50 450 
                                   C 50 300, 200 100, 400 150
                                   S 850 150, 900 350
                                   S 900 700, 900 800
                                   S 700 1100, 500 1100
                                   S 100 1000, 150 750
                                   S 400 500, 500 500"
                                fill="none"
                                stroke="#FFB6C1"
                                strokeWidth="380"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="road-path-backdrop"
                            />

                            {/* Main Path */}
                            <path
                                d="M 50 450 
                                   C 50 300, 200 100, 400 150
                                   S 850 150, 900 350
                                   S 900 700, 900 800
                                   S 700 1100, 500 1100
                                   S 100 1000, 150 750
                                   S 400 500, 500 500"
                                fill="none"
                                stroke="#EA4C6F"
                                strokeWidth="160"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="road-path-bg"
                            />
                            {/* Dashed center line */}
                            <path
                                d="M 50 450 
                                   C 50 300, 200 100, 400 150
                                   S 850 150, 900 350
                                   S 900 700, 900 800
                                   S 700 1100, 500 1100
                                   S 100 1000, 150 750
                                   S 400 500, 500 500"
                                fill="none"
                                stroke="rgba(255,255,255,0.5)"
                                strokeWidth="3"
                                strokeDasharray="15,15"
                                className="road-dashed-line"
                            />
                        </svg>
                    </div>
                )}

                {/* START Node */}
                <div className="start-node">
                    <div className="start-badge">START</div>
                </div>

                {/* Content Points */}

                {/* PUNTO 1 - Top Left/Center */}
                <div className="content-point point-1">
                    <div className="point-label">
                        <h2>PUNTO 1</h2>
                        <small>¿QUIÉNES SOMOS?</small>
                    </div>
                    <div className="bubble red-bubble">
                        Laboratorio educativo innovador <br />
                        (STEAM, tecnología, idiomas y emprendimiento)
                    </div>
                </div>

                {/* PUNTO 2 - Top Right */}
                <div className="content-point point-2">
                    <div className="point-label">
                        <h2>PUNTO 2</h2>
                        <small>¿QUÉ HACEMOS?</small>
                    </div>
                    <div className="bubble pink-bubble icon-bubble">
                        <span className="icon">💡</span>
                        Diseñamos e implementamos laboratorios educativos con metodología práctica y acompañamiento.
                    </div>
                </div>

                {/* PUNTO 3 - Middle Right */}
                <div className="content-point point-3">
                    <div className="point-label">
                        <h2>PUNTO 3</h2>
                        <small>PASO 1</small>
                    </div>
                    <div className="bubble red-bubble">
                        <h3>Montaje del laboratorio</h3>
                        <ul>
                            <li>Diagnóstico</li>
                            <li>Adecuación</li>
                            <li>Instalación tecnológica</li>
                            <li>Planificación académica</li>
                        </ul>
                    </div>
                </div>

                {/* PUNTO 4 - Bottom Center */}
                <div className="content-point point-4">
                    <div className="point-label">
                        <h2>PUNTO 4</h2>
                        <small>PASO 2</small>
                    </div>
                    <div className="bubble pink-bubble">
                        <h3>Temarios académicos</h3>
                        <ul>
                            <li>Emprendimiento</li>
                            <li>Nuevas Tecnologías</li>
                            <li>STEAM</li>
                            <li>Inglés por niveles</li>
                            <li>Starter Tech</li>
                        </ul>
                    </div>
                </div>

                {/* PUNTO 5 - Middle Left (Inner) */}
                <div className="content-point point-5">
                    <div className="point-label">
                        <h2>PUNTO 5</h2>
                        <small>PASO 3</small>
                    </div>
                    <div className="bubble red-bubble text-left">
                        <h3>Capacitación docente</h3>
                        <ul>
                            <li>Formación</li>
                            <li>Acompañamiento</li>
                            <li>Uso de plataformas</li>
                        </ul>
                    </div>
                </div>

                {/* META / END */}
                <div className="cta-container">
                    <div className="agenda-badge">¡AGENDA TU CITA!</div>
                    <div className="meta-star">
                        <span>META</span>
                    </div>
                </div>

                {/* Decorations */}
                <div className="floating-decorations">
                    <div className="heart">❤️</div>
                    <div className="dove">🕊️</div>
                    <div className="star-dec star-1">✨</div>
                    <div className="star-dec star-2">✨</div>
                </div>
            </div>
        </div>
    );
};
export default LandingPage;
