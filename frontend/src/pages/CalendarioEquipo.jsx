import React, { useState, useEffect } from "react";
import "../styles/CalendarioEquipo.css";
import {
  FaArrowLeft,
  FaChevronLeft,
  FaChevronRight,
  FaUser,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { calendarioApi } from "../services/api";
import { formatDate, formatShortDate, formatMonthYear, calculateDaysBetween } from "../utils/dateUtils";
import logo from "../assets/images/fondo.png";

// Mapeo de tipos de solicitud
const TIPOS_SOLICITUD = {
  1: "Vacaciones",
  2: "Maternidad",
  3: "Paternidad",
  4: "Incapacidad",
  5: "Otro"
};

const CalendarioEquipo = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPermiso, setSelectedPermiso] = useState(null);
  const [permisosActivos, setPermisosActivos] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);

  // Cargar datos del calendario
  useEffect(() => {
    const cargarDatosCalendario = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const anio = currentDate.getFullYear();
        const mes = currentDate.getMonth() + 1;
        
        // Cargar permisos y estadísticas en paralelo
        const [permisos, stats] = await Promise.all([
          calendarioApi.obtenerPorMes(anio, mes),
          calendarioApi.obtenerEstadisticas(anio, mes)
        ]);
        
        // Formatear los permisos para el calendario
        const permisosFormateados = permisos.map(p => ({
          nombre: `${p.empleado.nombre} ${p.empleado.apellido}`,
          tipo: TIPOS_SOLICITUD[p.tipoSolicitudId],
          desde: p.fechaInicio,
          hasta: p.fechaFin
        }));

        setPermisosActivos(permisosFormateados);
        setEstadisticas(stats);
        setSelectedPermiso(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosCalendario();
  }, [currentDate]);

  // Generar días del mes actual
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const monthName = formatMonthYear(currentDate);

  // Cambiar de mes
  const changeMonth = (offset) => {
    // Crear nueva fecha para evitar mutación
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + offset,
      1
    );
    setCurrentDate(newDate);
    setSelectedPermiso(null); // reset selección al cambiar mes
  };

  // Los permisos activos ahora se manejan con el estado permisosActivos

  // Función para saber si un día está ocupado y por qué permiso
  const permisoParaDia = (year, month, day) => {
    const fecha = new Date(year, month, day);
    return permisosActivos.find((permiso) => {
      const desde = new Date(permiso.desde);
      const hasta = new Date(permiso.hasta);
      return fecha >= desde && fecha <= hasta;
    });
  };

  // Función para crear contenido ICS para exportar permiso
  const generateICS = (permiso) => {
    const startDate = new Date(permiso.desde);
    const endDate = new Date(permiso.hasta);

    const formatDateICS = (date) => {
      // Formato YYYYMMDDT000000Z (asumimos todo el día)
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CalendarioEquipo//ES
BEGIN:VEVENT
SUMMARY=${permiso.tipo} - ${permiso.nombre}
DTSTART;VALUE=DATE:${formatDateICS(startDate).slice(0, 8)}
DTEND;VALUE=DATE:${formatDateICS(endDate).slice(0, 8)}
DESCRIPTION=Permiso de ${permiso.nombre} (${permiso.tipo})
END:VEVENT
END:VCALENDAR`;
  };

  // Descargar archivo ICS
  const downloadICS = () => {
    if (!selectedPermiso) return;
    const icsContent = generateICS(selectedPermiso);
    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const nombreArchivo = `${selectedPermiso.nombre.replace(/\s/g, "_")}_${
      selectedPermiso.tipo
    }.ics`;
    link.download = nombreArchivo;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="calendario-container">
      <div className="background-logo-container">
        <img src={logo} alt="Logo fondo" className="background-logo" />
      </div>

      {loading && (
        <div className="loading-overlay">
          <img src={logo} alt="Cargando..." className="loading-logo" />
          <p className="loading-text">Cargando calendario...</p>
          <div className="loader"></div>
        </div>
      )}

      {error && (
        <div className="error-overlay">
          <FaExclamationTriangle className="error-icon" />
          <p className="error-text">Error: {error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="calendario-content animate-form">
          {/* Encabezado */}
          <div className="header">
            <button className="volver-btn" onClick={() => navigate(-1)}>
              <FaArrowLeft /> Volver
            </button>
            <div>
              <h2>Calendario del Equipo</h2>
              <p>Visualiza la disponibilidad y permisos del equipo</p>
            </div>
          </div>

          <div className="main-content">
            {/* Calendario */}
            <div className="calendario-card">
              <div className="calendario-header">
                <h3>
                  {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
                </h3>
                <div className="month-controls">
                  <button onClick={() => changeMonth(-1)}>
                    <FaChevronLeft />
                  </button>
                  <button onClick={() => changeMonth(1)}>
                    <FaChevronRight />
                  </button>
                </div>
              </div>

              {/* Leyenda */}
              <div className="leyenda">
                <span className="disponible"></span> Días Disponibles
                <span className="ocupado"></span> Días Ocupados
              </div>

              {/* Días */}
              <div className="dias-grid">
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const permiso = permisoParaDia(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    day
                  );
                  return (
                    <div
                      key={i}
                      className={`dia ${
                        permiso ? "ocupado" : "disponible"
                      } animate-day`}
                      style={{
                        animationDelay: `${i * 0.02}s`,
                        cursor: permiso ? "pointer" : "default",
                      }}
                      onClick={() => permiso && setSelectedPermiso(permiso)}
                      title={
                        permiso ? `${permiso.nombre} - ${permiso.tipo}` : ""
                      }
                    >
                      {day}
                    </div>
                  );
                })}
              </div>

              {/* Detalles permiso seleccionado */}
              <div className="detalle-permiso" style={{ marginTop: "1rem" }}>
                {selectedPermiso ? (
                  <>
                    <h4>Permiso Seleccionado</h4>
                    <p>
                      <strong>Nombre:</strong> {selectedPermiso.nombre}
                    </p>
                    <p>
                      <strong>Tipo:</strong> {selectedPermiso.tipo}
                    </p>
                    <p>
                      <strong>Desde:</strong> {formatDate(selectedPermiso.desde)}
                    </p>
                    <p>
                      <strong>Hasta:</strong> {formatDate(selectedPermiso.hasta)}
                    </p>
                    <p>
                      <strong>Días:</strong> {calculateDaysBetween(selectedPermiso.desde, selectedPermiso.hasta)}d
                    </p>
                    <button onClick={downloadICS} className="btn-exportar-ics">
                      Exportar a Google Calendar
                    </button>
                  </>
                ) : (
                  <p>
                    Haz clic en un día ocupado para ver detalles del permiso
                  </p>
                )}
              </div>
            </div>

            {/* Panel lateral */}
            <div className="sidebar">
              <h3>Estado General del Mes</h3>
              <div className="estado-box verde">
                <p>Días Disponibles:</p>
                <h4>{estadisticas?.diasDisponibles || daysInMonth}</h4>
              </div>
              <div className="estado-box rojo">
                <p>Días Ocupados:</p>
                <h4>{estadisticas?.diasOcupados || 0}</h4>
              </div>
              <div className="estado-box">
                <p>Permisos Activos:</p>
                <h4>{permisosActivos.length}</h4>
              </div>

              <div className="proximos">
                <h3>Próximas Ausencias</h3>
                {permisosActivos.map((permiso, index) => (
                  <div key={index} className="ausencia-card">
                    <div className="ausencia-header">
                      <FaUser className="user-icon" />
                      <div>
                        <p className="nombre">{permiso.nombre}</p>
                        <p className="tipo">{permiso.tipo}</p>
                      </div>
                    </div>
                    <div className="ausencia-footer">
                      <p>
                        {formatShortDate(permiso.desde)} – {formatShortDate(permiso.hasta)}
                      </p>
                      <span>{calculateDaysBetween(permiso.desde, permiso.hasta)}d</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioEquipo;
