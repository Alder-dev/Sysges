import React, { useEffect, useState } from "react";
import "../styles/VerMisPermisos.css";
import { FaArrowLeft, FaPaperclip, FaCheckCircle, FaQuestionCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { solicitudesApi } from "../services/api";
import logo from "../assets/images/fondo.png";
import helpImage from "../assets/images/verpermisos.png";

// Mapeo de tipos de solicitud
const TIPOS_SOLICITUD = {
  1: "Vacaciones",
  2: "Maternidad",
  3: "Paternidad",
  4: "Incapacidad",
  5: "Otro"
};

const obtenerTipoPermiso = (id) => TIPOS_SOLICITUD[id] || "Desconocido";

const calcularDias = (fechaInicio, fechaFin) => {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const diffTime = fin.getTime() - inicio.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

const VerMisPermisos = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [permisos, setPermisos] = useState([]);
  const [showHelp, setShowHelp] = useState(false);
  const [error, setError] = useState(null);

  // Cargar permisos desde el backend
  useEffect(() => {
    const cargarPermisos = async () => {
      try {
        const data = await solicitudesApi.obtenerMisSolicitudes();
        const permisosFormateados = data.map(permiso => ({
          id: permiso.id,
          tipo: obtenerTipoPermiso(permiso.tipoSolicitudId),
          fechaInicio: new Date(permiso.fechaInicio).toLocaleDateString(),
          fechaFin: new Date(permiso.fechaFin).toLocaleDateString(),
          dias: calcularDias(permiso.fechaInicio, permiso.fechaFin),
          comentarios: permiso.motivo,
          archivo: permiso.archivoUrl,
          estado: permiso.estado.toLowerCase()
        }));
        setPermisos(permisosFormateados);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    cargarPermisos();
  }, []);

  return (
    <div className="verpermisos-container">
      {/* Fondo con logo */}
      <div className="background-logo-container">
        <img src={logo} alt="Fondo Logo" className="background-logo" />
      </div>

      {/* Pantalla de carga */}
      {loading && (
        <div className="loading-overlay">
          <img src={logo} alt="Cargando..." className="loading-logo" />
          <p className="loading-text">Cargando tus permisos...</p>
          <div className="loader"></div>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}

      {/* Contenido principal */}
      {!loading && !error && (
        <div className="verpermisos-card animate-form">
          <button className="volver-btn" onClick={() => navigate("/dashboard")}>
            <FaArrowLeft /> Volver al Panel
          </button>

          <h2>Mis Permisos</h2>
          <p className="subtitulo">
            Aquí puedes revisar tus solicitudes y su estado actual.
          </p>

          {permisos.length === 0 ? (
            <div className="no-permisos">
              <p>No tienes solicitudes de permisos registradas.</p>
            </div>
          ) : (
            permisos.map((permiso, index) => (
              <div
                key={permiso.id}
                className={`permiso-item animate-permiso`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="permiso-info">
                  <p className="permiso-titulo">{permiso.tipo}</p>
                  <p className="permiso-fecha">
                    {permiso.fechaInicio} - {permiso.fechaFin} ({permiso.dias}{" "}
                    día{permiso.dias > 1 ? "s" : ""})
                  </p>
                  <p className="permiso-comentarios">{permiso.comentarios}</p>
                  {permiso.archivo && (
                    <div className="permiso-archivo">
                      <FaPaperclip className="icono-archivo" />
                      <a 
                        href={permiso.archivo} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="archivo-link"
                      >
                        Ver archivo adjunto
                      </a>
                    </div>
                  )}
                </div>
                <span
                  className={`estado ${permiso.estado}`}
                >
                  {permiso.estado === "aprobado" && <FaCheckCircle />}{" "}
                  {permiso.estado.charAt(0).toUpperCase() + permiso.estado.slice(1)}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Botón flotante de ayuda */}
      <button className="help-permisos-btn" onClick={() => setShowHelp(true)}>
        <FaQuestionCircle />
      </button>

      {/* Modal de ayuda */}
      {showHelp && (
        <div className="help-permisos-modal" onClick={() => setShowHelp(false)}>
          <div
            className="help-permisos-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={helpImage} alt="Ayuda sobre permisos" />
            <button
              className="help-permisos-close"
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

export default VerMisPermisos;
