// Formato personalizado de fechas para español
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

// Formato corto de fecha (dd/mm/yyyy)
export const formatShortDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Formato de mes y año
export const formatMonthYear = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('es-ES', {
    month: 'long',
    year: 'numeric'
  });
};

// Calcular la diferencia en días entre dos fechas
export const calculateDaysBetween = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

// Verificar si una fecha está entre dos fechas
export const isDateBetween = (date, startDate, endDate) => {
  if (!date || !startDate || !endDate) return false;
  const d = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  return d >= start && d <= end;
};