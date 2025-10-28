import React, { useState, useEffect } from "react";
import "../styles/PendingRequests.css";
import { FaSpinner } from "react-icons/fa";
import { solicitudesApi } from "../services/api";

const TIPOS_SOLICITUD = {
  1: "Vacaciones",
  2: "Maternidad",
  3: "Paternidad",
  4: "Incapacidad",
  5: "Otro",
};

function AuthorizedList({ onAction, searchTerm = "" }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null); // ID de la solicitud que se está eliminando

  // Cargar permisos aprobados
  useEffect(() => {
    let mounted = true;

    const cargarPermisos = async () => {
      try {
        setLoading(true);
        setError(null);

        const permisos = await solicitudesApi.obtenerAprobadas();
        if (!mounted) return;

        const formatted = permisos.map((p) => {
          const emp = p.empleado || {};
          const nombre = `${emp.nombre || ""} ${emp.apellido || ""}`.trim();
          const dias =
            p.fechaInicio && p.fechaFin
              ? Math.ceil(
                  (new Date(p.fechaFin) - new Date(p.fechaInicio)) /
                    (1000 * 60 * 60 * 24)
                ) + 1
              : 0;

          return {
            id: p.id,
            nombre,
            cargo: emp.cargo || "",
            tipo: TIPOS_SOLICITUD[p.tipoSolicitudId] || "Otro",
            inicio: p.fechaInicio
              ? new Date(p.fechaInicio).toLocaleDateString()
              : "",
            fin: p.fechaFin ? new Date(p.fechaFin).toLocaleDateString() : "",
            dias,
            comentarios: p.motivo || "",
            contacto: emp.telefono || "No disponible",
            estado: p.estado || "aprobado",
          };
        });

        setRequests(formatted);
      } catch (err) {
        setError(err.message || "Error al cargar las solicitudes.");
      } finally {
        setLoading(false);
      }
    };

    cargarPermisos();
    return () => {
      mounted = false;
    };
  }, []);

  // Acción local (Eliminar)
  const handleAction = async (id, action) => {
    // 1. Busca la solicitud
    const req = requests.find((r) => r.id === id);
    
    if (!req) {
      console.error('Solicitud no encontrada');
      return;
    }
    
    try {
      // 2. Llamada al backend para eliminar
      if (action === "eliminado") {
        setDeleting(id); // Mostrar estado de carga
        await solicitudesApi.eliminarSolicitud(id);
      }
      
      // 3. Ejecuta el callback
      if (onAction) {
        onAction(action === "aprobado" ? "approve" : "delete", req.nombre);
      }
      
      // 4. Elimina del estado local
      setRequests((prev) => prev.filter((r) => r.id !== id));
      
    } catch (error) {
      console.error('Error al eliminar la solicitud:', error);
      alert('No se pudo eliminar la solicitud. Por favor, intenta de nuevo.');
    } finally {
      setDeleting(null); // Quitar estado de carga
    }
  };

  // Filtrado por búsqueda
  const filtered = searchTerm
    ? requests.filter(
        (r) =>
          r.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.tipo.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : requests;

  // Render
  return (
    <div className="pending-list">
      {loading && (
        <div className="loading-state">
          <FaSpinner className="spinner" />
          <p>Cargando permisos aprobados...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p>Error al cargar las solicitudes: {error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="empty-state">
          No hay permisos aprobados
          {searchTerm ? " que coincidan con la búsqueda." : "."}
        </div>
      )}

      {!loading &&
        !error &&
        filtered.map((req) => (
          <div key={req.id} className="pending-card">
            <div className="pending-header">
              <div className="pending-info">
                <span className="pending-icon">✅</span>
                <h4>{req.nombre}</h4>
                <small>{req.cargo}</small>
              </div>
            </div>

            <div className="pending-body">
              <p>
                <strong>Tipo:</strong> {req.tipo}
              </p>
              <p>
                <strong>Periodo:</strong> {req.inicio} → {req.fin}
              </p>
              <p>
                <strong>Días Totales:</strong> {req.dias}
              </p>
              <p>
                <strong>Comentarios:</strong> {req.comentarios}
              </p>
              <p>
                <strong>Contacto:</strong>{" "}
                <a href={`tel:${req.contacto}`}>{req.contacto}</a>
              </p>
            </div>

            <div className="pending-actions">
              <button
                className="pending-delete"
                onClick={() => handleAction(req.id, "eliminado")}
                disabled={deleting === req.id}
              >
                {deleting === req.id ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}

export default AuthorizedList;