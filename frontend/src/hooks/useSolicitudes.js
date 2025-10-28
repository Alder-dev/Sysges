import { useState } from 'react';
import { solicitudesApi } from '../services/api';

export const useSolicitudes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const crearSolicitud = async (solicitudData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await solicitudesApi.crear(solicitudData);
      setSuccess(true);
      return { success: true, data: response };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const validarFechas = (fechaInicio, fechaFin, diasDisponibles) => {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    // Validar que la fecha de inicio no sea anterior a hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (inicio < hoy) {
      return { 
        isValid: false, 
        message: 'La fecha de inicio no puede ser anterior a hoy' 
      };
    }

    // Validar que la fecha fin no sea anterior a la fecha inicio
    if (fin < inicio) {
      return { 
        isValid: false, 
        message: 'La fecha de fin no puede ser anterior a la fecha de inicio' 
      };
    }

    // Calcular días laborables entre las fechas (excluyendo fines de semana)
    let diasLaborables = 0;
    const actual = new Date(inicio);
    while (actual <= fin) {
      if (actual.getDay() !== 0 && actual.getDay() !== 6) {
        diasLaborables++;
      }
      actual.setDate(actual.getDate() + 1);
    }

    // Validar que no exceda los días disponibles
    if (diasLaborables > diasDisponibles) {
      return { 
        isValid: false, 
        message: `La solicitud excede los días disponibles (${diasDisponibles} días)` 
      };
    }

    return { 
      isValid: true, 
      diasLaborables 
    };
  };

  return {
    loading,
    error,
    success,
    crearSolicitud,
    validarFechas,
    resetStates: () => {
      setError(null);
      setSuccess(false);
    }
  };
};