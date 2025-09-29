import React, { useState } from 'react';
import { auth } from '../lib/supabase';
import './LoginScreen.css';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await auth.signIn(email, password);

      if (error) {
        console.error('Error al iniciar sesión:', error.message);
        alert('Error al iniciar sesión: ' + error.message);
      } else {
        console.log('Login exitoso:', data.user);
        // La redirección se maneja automáticamente por el App.tsx
        // cuando detecta el cambio en el estado de autenticación
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      alert('Error inesperado al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Fondo con gradiente espacial */}
      <div className="background-gradient">
        {/* Elementos decorativos */}
        <div className="stars">
          <div className="star star-1"></div>
          <div className="star star-2"></div>
          <div className="star star-3"></div>
          <div className="star star-4"></div>
          <div className="star star-5"></div>
        </div>
        
        {/* Planetas decorativos */}
        <div className="planets">
          <div className="planet planet-1"></div>
          <div className="planet planet-2"></div>
        </div>
      </div>

      {/* Logo EPICGROUP LAB */}
      <div className="logo-container">
        <img src="/src/assets/epic2.png" alt="EPICGROUP LAB" className="main-logo" />
        <div className="logo-text">

        </div>
      </div>


      {/* Formulario flotante transparente */}
      <div className="floating-form-container">
        <div className="floating-form">
          <div className="form-header">
            <h2>Bienvenido</h2>
            <p>Inicia sesión en tu cuenta</p>
          </div>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Recordarme</span>
              </label>
              <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
            </div>
            
            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>
          
          <div className="form-footer">
            <p>¿No tienes cuenta? <a href="#" className="signup-link">Regístrate aquí</a></p>
          </div>
        </div>
      </div>

      {/* Elementos decorativos adicionales */}
      <div className="decorative-elements">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>
    </div>
  );
};

export default LoginScreen;
