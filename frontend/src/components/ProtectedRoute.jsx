import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirigir a login y guardar la ubicación intentada
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Si se especifican roles permitidos, verificar si el usuario tiene acceso
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.tipo)) {
    // Redirigir a dashboard si no tiene permisos
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;