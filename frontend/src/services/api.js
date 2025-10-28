// frontend/src/services/api.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Helper para manejar respuestas
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error del servidor' }));
    throw new Error(error.message || 'Error en la solicitud');
  }
  return response.json();
};

// Helper para obtener el token
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// ============================================
// AUTENTICACIÓN
// ============================================
export const authApi = {
  login: async (correo, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, password }),
    });
    const data = await handleResponse(response);
    
    // Guardar token
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('empleado', JSON.stringify(data.empleado));
    }
    
    return data;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('empleado');
  },

  getCurrentUser: () => {
    const empleado = localStorage.getItem('empleado');
    return empleado ? JSON.parse(empleado) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },
};

// ============================================
// SOLICITUDES
// ============================================
export const solicitudesApi = {
  crear: async (solicitud) => {
    // Si hay archivo adjunto, usar FormData
    if (solicitud.archivo) {
      const formData = new FormData();
      
      // Añadir datos de la solicitud
      Object.keys(solicitud).forEach(key => {
        if (key !== 'archivo') {
          formData.append(key, solicitud[key]);
        }
      });
      
      // Añadir archivo si existe
      if (solicitud.archivo instanceof File) {
        formData.append('archivo', solicitud.archivo);
      }

      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/solicitudes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      return handleResponse(response);
    } else {
      // Sin archivo, enviar JSON normal
      const response = await fetch(`${API_URL}/solicitudes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(solicitud),
      });
      return handleResponse(response);
    }
  },

  obtenerMisSolicitudes: async () => {
    const response = await fetch(`${API_URL}/solicitudes/mis-solicitudes`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  obtenerPendientes: async () => {
    const response = await fetch(`${API_URL}/solicitudes/pendientes`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  obtenerAprobadas: async () => {
    const response = await fetch(`${API_URL}/solicitudes/aprobadas`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  obtenerPorId: async (id) => {
    const response = await fetch(`${API_URL}/solicitudes/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  aprobarSolicitud: async (id) => {
    try {
      const response = await fetch(`${API_URL}/solicitudes/${id}/aprobar`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      await handleResponse(response);
      return true;
    } catch (error) {
      console.error('Error al aprobar solicitud:', error);
      throw error;
    }
  },

  rechazarSolicitud: async (id) => {
    try {
      const response = await fetch(`${API_URL}/solicitudes/${id}/rechazar`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      await handleResponse(response);
      return true;
    } catch (error) {
      console.error('Error al rechazar solicitud:', error);
      throw error;
    }
  },

  eliminarSolicitud: async (id) => {
    try {
      const response = await fetch(`${API_URL}/solicitudes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      await handleResponse(response);
      return true;
    } catch (error) {
      console.error('Error al eliminar solicitud:', error);
      throw error;
    }
  },
};

// ============================================
// APROBACIONES
// ============================================
export const aprobacionesApi = {
  crear: async (aprobacion) => {
    const response = await fetch(`${API_URL}/aprobaciones`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(aprobacion),
    });
    return handleResponse(response);
  },

  aprobar: async (solicitudId, comentarios = '') => {
    return aprobacionesApi.crear({
      solicitudId,
      decision: 'Aprobado',
      comentarios,
    });
  },

  rechazar: async (solicitudId, comentarios = '') => {
    return aprobacionesApi.crear({
      solicitudId,
      decision: 'Rechazado',
      comentarios,
    });
  },
};

// ============================================
// CALENDARIO
// ============================================
export const calendarioApi = {
  obtenerPorMes: async (anio, mes) => {
    const response = await fetch(`${API_URL}/calendario/${anio}/${mes}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  obtenerEstadisticas: async (anio, mes) => {
    const response = await fetch(`${API_URL}/calendario/estadisticas/${anio}/${mes}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Exportar todo como un objeto
const api = {
  auth: authApi,
  solicitudes: solicitudesApi,
  aprobaciones: aprobacionesApi,
  calendario: calendarioApi,
};

export default api;