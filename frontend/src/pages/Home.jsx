import React, { useState, useEffect } from "react";
import "../styles/Home.css";
import {
  FaFileAlt,
  FaFolderOpen,
  FaCalendarAlt,
  FaSignOutAlt,
  FaQuestionCircle,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { solicitudesApi } from "../services/api";
import logo from "../assets/images/fondo.png";
import helpImage from "../assets/images/helplogin.png";

// Mapeo de tipos de solicitud
const TIPOS_SOLICITUD = {
  1: "Vacaciones",
  2: "Maternidad",
  3: "Paternidad",
  4: "Incapacidad",
  5: "Otro"
};

const DashboardEmpleado = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showHelp, setShowHelp] = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(true);
  const [error, setError] = useState(null);

  // Cargar las últimas solicitudes al montar el componente
  useEffect(() => {
    const cargarSolicitudes = async () => {
      try {
        setLoadingSolicitudes(true);
        const response = await solicitudesApi.obtenerMisSolicitudes();
        // Ordenar por fecha de creación más reciente y tomar las últimas 3
        const solicitudesOrdenadas = response
          .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
          .slice(0, 3);
        setSolicitudes(solicitudesOrdenadas);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingSolicitudes(false);
      }
    };

    cargarSolicitudes();
  }, []);

  const handleLogout = () => {
    window.location.href = "/";
  };

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="dashboard-header">
        <div className="header-info">
          <div className="logo-title">
            <img src={logo} alt="Logo" className="header-logo" />
            <h2 className="titulo-panel">Panel Principal del Empleado</h2>
          </div>
          <p className="bienvenida">Bienvenido, {user?.nombre || 'Usuario'}</p>
        </div>
        <button className="logout-btn2" onClick={handleLogout}>
          <FaSignOutAlt /> Cerrar Sesión
        </button>
      </div>

      {/* SALDO */}
      <div className="saldo-card animate-card">
        <p className="saldo-titulo">Saldo de Días Disponibles</p>
        <p className="saldo-subtitulo">Tu balance actual de días de permiso</p>
        <h1 className="saldo-numero">{user?.diasDisponibles || 0}</h1>
        <p className="saldo-descripcion">días disponibles</p>
      </div>

      {/* ACCIONES */}
      <div className="acciones-container">
        <div
          className="accion-card animate-card"
          onClick={() => navigate("/solicitar-permisos")}
        >
          <FaFileAlt className="icono" />
          <h3>Solicitar Permisos</h3>
          <p>Crear nueva solicitud de permiso o licencia</p>
        </div>

        <div
          className="accion-card animate-card"
          onClick={() => navigate("/ver-mis-permisos")}
        >
          <FaFolderOpen className="icono" />
          <h3>Ver Mis Permisos</h3>
          <p>Consulta el historial de tus solicitudes</p>
        </div>

        <div
          className="accion-card animate-card"
          onClick={() => navigate("/ver-calendario")}
        >
          <FaCalendarAlt className="icono" />
          <h3>Ver Calendario del Equipo</h3>
          <p>Visualiza la disponibilidad del equipo</p>
        </div>
      </div>

      {/* SOLICITUDES */}
      <div className="solicitudes-card animate-card">
        <h4>Solicitudes Recientes</h4>
        <p>Últimas solicitudes realizadas</p>
        
        {loadingSolicitudes ? (
          <div className="loading-solicitudes">
            <FaSpinner className="spinner-icon" />
            <p>Cargando solicitudes...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>No se pudieron cargar las solicitudes</p>
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="no-solicitudes">
            <p>No hay solicitudes recientes</p>
          </div>
        ) : (
          solicitudes.slice(0, 1).map((solicitud) => (
            <div key={solicitud.id} className="solicitud-item">
              <div>
                <p className="solicitud-titulo">
                  {TIPOS_SOLICITUD[solicitud.tipoSolicitudId]}
                </p>
                <p className="solicitud-fecha">Motivo: {solicitud.motivo}</p>
                <p className="solicitud-fecha">
                  {new Date(solicitud.fechaInicio).toLocaleDateString()} - {" "}
                  {new Date(solicitud.fechaFin).toLocaleDateString()}
                </p>
              </div>
              <span className={`estado-${solicitud.estado.toLowerCase()}`}>
                {solicitud.estado === "APROBADO" && <FaCheckCircle className="icon-estado" />}
                {solicitud.estado.toLowerCase()}
              </span>
            </div>
          ))
        )}
      </div>

      {/* ===== BOTÓN DE AYUDA FLOTANTE ===== */}
      <button className="dashboard-help-btn" onClick={() => setShowHelp(true)}>
        <FaQuestionCircle />
      </button>

      {/* ===== MODAL DE AYUDA ===== */}
      {showHelp && (
        <div className="dashboard-help-modal" onClick={() => setShowHelp(false)}>
          <div
            className="dashboard-help-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={helpImage} alt="Ayuda del sistema" />
            <button
              className="dashboard-close-btn"
              onClick={() => setShowHelp(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardEmpleado;
