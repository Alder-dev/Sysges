import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Login.css";
import { FaQuestionCircle } from "react-icons/fa";
import logo from "../assets/images/comfachoco-logo.png";
import helplogin from "../assets/images/helplogin.png";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [userType, setUserType] = useState("persona");
  const [showHelp, setShowHelp] = useState(false);
  const navigate = useNavigate();

  const { login } = useAuth();
  const location = useLocation();
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const correo = e.target[0].value;
      const password = e.target[1].value;

      const result = await login(correo, password);
      
      if (result.success) {
        const from = location.state?.from?.pathname || 
          (result.data.empleado.tipo === 'Directivo' ? '/panel-admin' : '/dashboard');
        navigate(from, { replace: true });
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Error al intentar iniciar sesión. Por favor, intenta de nuevo.');
    }
  };

  return (
    <div className="login-container">
      {/* ===== FONDO DIFUMINADO ===== */}
      <div className="background-logo">
        <img src={logo} alt="Fondo Comfachocó" />
      </div>

      {/* ===== CAJA PRINCIPAL ===== */}
      <div className="login-box">
        <img src={logo} alt="Logo Comfachocó" className="logo" />
        <h1>Sistema de Gestión de Permisos</h1>
        <p className="subtitle">COMFACHOCÓ - Ingresa tus credenciales</p>

        {/* ===== SELECTOR DE ROL ===== */}
        <div className="role-selector">
          <label
            className={`role-option ${userType === "persona" ? "active" : ""}`}
            onClick={() => setUserType("persona")}
          >
            <span className="custom-radio" />
            <div>
              <strong>Persona Natural</strong>
              <p>Empleados y supervisores</p>
            </div>
          </label>

          <label
            className={`role-option ${userType === "admin" ? "active" : ""}`}
            onClick={() => setUserType("admin")}
          >
            <span className="custom-radio" />
            <div>
              <strong>Supervisor</strong>
              <p>Control total del sistema</p>
            </div>
          </label>
        </div>

        {/* ===== FORMULARIO ===== */}
        <form className="login-form" onSubmit={handleLogin}>
          <input type="text" placeholder="Ingresa tu usuario" required />
          <input type="password" placeholder="Ingresa tu contraseña" required />
          {error && <p className="error-message">{error}</p>}
          <p className="hint">
            Usa "supervisor" como usuario para acceder como supervisor.
          </p>
          <button type="submit">Ingresar</button>
        </form>
      </div>

      {/* ===== BOTÓN FLOTANTE DE AYUDA ===== */}
      <button
        className="login-help-btn"
        onClick={() => setShowHelp(true)}
        aria-label="Mostrar ayuda"
      >
        <FaQuestionCircle />
      </button>

      {/* ===== MODAL DE AYUDA (CORREGIDO) ===== */}
      {showHelp && (
        <div className="help-modal-overlay" onClick={() => setShowHelp(false)}>
          <div className="help-modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={helplogin} alt="Guía de inicio de sesión" />
            <button
              className="help-close-btn"
              onClick={() => setShowHelp(false)}
              aria-label="Cerrar ayuda"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
