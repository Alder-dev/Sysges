import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Home from "./pages/Home";
import SolicitarPermisos from "./pages/SolicitarPermisos";
import VerMisPermisos from "./pages/VerMisPermisos";
import CalendarioEquipo from "./pages/CalendarioEquipo";
import PanelAdmin from "./pages/PanelAdmin";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          
          {/* Rutas protegidas para todos los usuarios autenticados */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/solicitar-permisos" element={
            <ProtectedRoute>
              <SolicitarPermisos />
            </ProtectedRoute>
          } />
          <Route path="/ver-mis-permisos" element={
            <ProtectedRoute>
              <VerMisPermisos />
            </ProtectedRoute>
          } />
          <Route path="/ver-calendario" element={
            <ProtectedRoute>
              <CalendarioEquipo />
            </ProtectedRoute>
          } />

          {/* Ruta protegida solo para directivos */}
          <Route path="/panel-admin" element={
            <ProtectedRoute allowedRoles={['Directivo']}>
              <PanelAdmin />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
