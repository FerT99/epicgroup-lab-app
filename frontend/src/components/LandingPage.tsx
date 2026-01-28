// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './LandingPage.css';

// const LandingPage: React.FC = () => {
//     const navigate = useNavigate();
//     const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

//     useEffect(() => {
//         const handleResize = () => setIsMobile(window.innerWidth <= 768);
//         window.addEventListener('resize', handleResize);
//         return () => window.removeEventListener('resize', handleResize);
//     }, []);

//     const handleLogin = () => {
//         navigate('/login');
//     };

//     return (
//         <div className="landing-container">
//             <button className="top-login-btn" onClick={handleLogin}>
//                 INICIAR SESIÓN
//             </button>
//             <header className="landing-header">
//                 <div className="logo-container">
//                     {/* Placeholder for logo if needed, otherwise just text */}
//                 </div>
//                 <div className="main-tagline">
//                     <h1 className="epic-title">
//                         <span className="epic-star-icon">✨</span>
//                         EPICGROUP
//                     </h1>
//                     <div className="lab-row">
//                         <span className="subtitle">innovación educativa</span>
//                         <h1 className="lab-title">LAB</h1>
//                     </div>
//                 </div>
//                 <p className="description">
//                     Así transformamos espacios educativos en laboratorios de aprendizaje innovador.
//                 </p>
//             </header>

//             <div className="path-container">
//                 {/* SVG Winding Path - Desktop/Tablet */}
//                 {!isMobile && (
//                     <div className="svg-background">
//                         <svg viewBox="0 0 1000 1300" preserveAspectRatio="xMidYMid meet" className="road-svg">
//                             {/*
//                             {/* Spiral Path */}
//                             <defs>
//                                 <linearGradient id="spiralGradient" x1="0%" y1="0%" x2="100%" y2="0%">
//                                     <stop offset="0%" stopColor="#F472B6" />
//                                     <stop offset="100%" stopColor="#EA4C6F" />
//                                 </linearGradient>
//                             </defs>

//                             {/* Path definition: Start -> P1 -> P2 -> P3 -> P4 -> P5 -> Meta */}
//                             <path
//                                 d="M 50 450
//                                    C 50 200, 250 100, 350 120
//                                    S 850 100, 920 220
//                                    S 980 450, 950 550
//                                    S 750 900, 600 850
//                                    S 100 800, 150 750
//                                    S 400 500, 500 450"
//                                 fill="none"
//                                 stroke="#EA4C6F"
//                                 strokeWidth="130"
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 opacity="0.9"
//                             />

//                             {/* Dotted Line Overlay */}
//                             <path
//                                 d="M 50 450
//                                    C 50 200, 250 100, 350 120
//                                    S 850 100, 920 220
//                                    S 980 450, 950 550
//                                    S 750 900, 600 850
//                                    S 100 800, 150 750
//                                    S 400 500, 500 450"
//                                 fill="none"
//                                 stroke="white"
//                                 strokeWidth="4"
//                                 strokeDasharray="15, 20"
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                             />
//                         </svg>
//                     </div>
//                 )}

//                 {/* START Node */}
//                 <div className="start-node">
//                     <div className="start-ticket">
//                         START
//                     </div>
//                 </div>

//                 {/* PUNTO 1: ¿QUIÉNES SOMOS? */}
//                 <div className="content-point point-1">
//                     <div className="point-label">
//                         <h2>PUNTO 1</h2>
//                         <small>¿QUIÉNES SOMOS?</small>
//                     </div>
//                     {/* Dashed arrow pointing to computer if desired */}
//                     <div className="computer-icon-img">
//                         💻
//                     </div>
//                     <div className="bubble red-bubble">
//                         Laboratorio educativo innovador <br />
//                         (STEAM, tecnología, idiomas y emprendimiento)
//                     </div>
//                 </div>

//                 {/* PUNTO 2: ¿QUÉ HACEMOS? */}
//                 <div className="content-point point-2">
//                     <div className="point-label">
//                         <h2>PUNTO 2</h2>
//                         <small>¿QUÉ HACEMOS?</small>
//                     </div>
//                     <div className="lightbulb-icon">
//                         💡
//                     </div>
//                     <div className="bubble transparent-bubble">
//                         Diseñamos e implementamos laboratorios educativos con metodología práctica y acompañamiento.
//                     </div>
//                 </div>

//                 {/* PUNTO 3: PASO 1 */}
//                 <div className="content-point point-3">
//                     <div className="point-label">
//                         <h2>PUNTO 3</h2>
//                         <small>PASO 1</small>
//                     </div>
//                     <div className="globe-icon">
//                         🌐
//                     </div>
//                     <div className="bubble red-bubble list-left">
//                         <h3>Montaje del laboratorio</h3>
//                         <ul>
//                             <li>Diagnóstico</li>
//                             <li>Adecuación</li>
//                             <li>Instalación tecnológica</li>
//                             <li>Planificación académica</li>
//                         </ul>
//                     </div>
//                 </div>

//                 {/* PUNTO 4: PASO 2 */}
//                 <div className="content-point point-4">
//                     <div className="point-label">
//                         <h2>PUNTO 4</h2>
//                         <small>PASO 2</small>
//                     </div>
//                     <div className="flower-icon">
//                         🌺
//                     </div>
//                     <div className="bubble red-bubble list-left">
//                         <h3>Temarios académicos</h3>
//                         <ul>
//                             <li>Emprendimiento</li>
//                             <li>Nuevas Tecnologías</li>
//                             <li>STEAM</li>
//                             <li>Inglés por niveles</li>
//                             <li>Starter Tech</li>
//                         </ul>
//                     </div>
//                 </div>

//                 {/* PUNTO 5: PASO 3 */}
//                 <div className="content-point point-5">
//                     <div className="point-label">
//                         <h2>PUNTO 5</h2>
//                         <small>PASO 3</small>
//                     </div>
//                     <div className="teacher-icon">
//                         👨‍🏫
//                     </div>
//                     <div className="bubble red-bubble list-left">
//                         <h3>Capacitación docente</h3>
//                         <ul>
//                             <li>Formación</li>
//                             <li>Acompañamiento</li>
//                             <li>Uso de plataformas</li>
//                         </ul>
//                     </div>
//                 </div>

//                 {/* META */}
//                 <div className="meta-container">
//                     <div className="meta-burst">
//                         META
//                     </div>
//                     <div className="agenda-btn">
//                         ¡AGENDA TU CITA!
//                     </div>
//                 </div>

//                 {/* Decorative Elements */}
//                 <div className="floating-decorations">
//                     <div className="dec-heart">❤️</div>
//                     <div className="dec-dove">🕊️</div>
//                     <div className="dec-star ds-1">✨</div>
//                     <div className="dec-star ds-2">✨</div>
//                     <div className="dec-star ds-3">✨</div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default LandingPage;
