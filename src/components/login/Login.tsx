import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import './Login.css'; // Archivo CSS para los estilos


interface LoginProps {
  onLoginSuccess: () => void; 
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  
  const validUsername = 'usuario';
  const validPasswordHash = CryptoJS.SHA256('contraseña123').toString(); 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');


    setTimeout(() => {
    
      const enteredPasswordHash = CryptoJS.SHA256(password).toString();
      
      if (username === validUsername && enteredPasswordHash === validPasswordHash) {
        // Login exitoso
        onLoginSuccess(); 
      } else {
        setError('Usuario o contraseña incorrectos');
      }
      setLoading(false);
    }, 1500); 
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1> Sistema de Logistica RODVAL</h1>
        <h3>Iniciar Sesion</h3>
        {loading ? (
  <div className="loading-container">
    <div className="spinner"></div>
    <p>Cargando...</p>
  </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="username">Usuario:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="password">Contraseña:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <button type="submit" className="login-button">
              Ingresar
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;