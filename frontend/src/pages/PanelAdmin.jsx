import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthorizedList from "../components/AuthorizedList";
import PendingRequests from "../components/PendingRequests";
import SummaryCards from "../components/SummaryCards";
import fondo from "../assets/images/fondo.png";
import logo from "../assets/images/comfachoco-logo.png";
import "../styles/PanelAdmin.css";

function PanelAdmin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("autorizados");
  const [notifications, setNotifications] = useState(3);
  const [modal, setModal] = useState({ open: false, type: "", message: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [activityLog, setActivityLog] = useState([
    "Permiso aprobado para María López",
    "Solicitud rechazada: Juan Pérez",
    "Nuevo permiso pendiente de revisión"
  ]);

  // Información legal de permisos en Colombia
  const legalInfo = [
    { tipo: "Vacaciones", dias: "15 días hábiles", ley: "Código Sustantivo del Trabajo - Art. 186", descripcion: "Por cada año de servicio" },
    { tipo: "Maternidad", dias: "18 semanas", ley: "Ley 1822 de 2017", descripcion: "Licencia remunerada preparto y posparto" },
    { tipo: "Paternidad", dias: "2 semanas", ley: "Ley 1822 de 2017", descripcion: "Licencia remunerada por nacimiento" },
    { tipo: "Luto", dias: "5 días hábiles", ley: "Ley 1280 de 2009", descripcion: "Por fallecimiento de familiar hasta 2° grado" },
    { tipo: "Calamidad Doméstica", dias: "Variable", ley: "Código Sustantivo del Trabajo", descripcion: "Según gravedad de la situación" },
    { tipo: "Lactancia", dias: "2 descansos de 30 min", ley: "Código Sustantivo del Trabajo - Art. 238", descripcion: "Diarios durante los primeros 6 meses" },
    { tipo: "Médico", dias: "Según incapacidad", ley: "Ley 776 de 2002", descripcion: "Certificado por EPS o medicina laboral" }
  ];

  const handleAction = (type, name) => {
    let message = "";
    if (type === "approve") message = `Has aprobado el permiso de ${name}.`;
    if (type === "reject") message = `Has rechazado el permiso de ${name}.`;
    if (type === "delete") message = `Has eliminado el permiso de ${name}.`;

    const newLog = `${message} (${new Date().toLocaleTimeString()})`;
    setActivityLog([newLog, ...activityLog.slice(0, 4)]);

    setModal({ open: true, type, message });
    
    if (type === "approve" || type === "reject") {
      setNotifications(prev => Math.max(0, prev - 1));
    }
  };

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="panel-admin" style={{ backgroundImage: `url(${fondo})` }}>
      <div className="overlay">
        {/* HEADER */}
        <header className="admin-header">
          <div className="logo-section">
            <div className="brand-container">
              <img src={logo} alt="Logo Comfachocó" className="admin-logo" />
              <div className="brand-text">
                <span className="brand-name">COMFACHOCÓ</span>
                <span className="brand-tagline">Caja de Compensación Familiar</span>
              </div>
            </div>
            <div className="header-divider"></div>
            <div className="panel-info">
              <h1>Panel de Administración</h1>
              <p>Gestión de permisos y control de empleados</p>
            </div>
          </div>

          <nav className="admin-nav">
            <div className="nav-buttons">
              <button
                className={activeTab === "autorizados" ? "active" : ""}
                onClick={() => setActiveTab("autorizados")}
              >
                📋 Autorizados
              </button>
              <button
                className={activeTab === "pendientes" ? "active" : ""}
                onClick={() => setActiveTab("pendientes")}
              >
                ⏳ Pendientes
              </button>
              <button
                className={activeTab === "legal" ? "active" : ""}
                onClick={() => setActiveTab("legal")}
              >
                ⚖️ Info Legal
              </button>
              <button className="notif-btn">
                🔔 {notifications > 0 && <span>{notifications}</span>}
              </button>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              🚪 Salir
            </button>
          </nav>
        </header>

        {/* MAIN */}
        <main className="admin-content">
          <SummaryCards compact />

          {/* BUSCADOR - Solo en autorizados y pendientes */}
          {activeTab !== "legal" && (
            <div className="search-bar">
              <input
                type="text"
                placeholder="🔍 Buscar empleado o solicitud..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}

          <div className="section-title">
            <h2>
              {activeTab === "autorizados"
                ? "Permisos Autorizados ✅"
                : activeTab === "pendientes"
                ? "Solicitudes Pendientes 📬"
                : "Información Legal de Permisos ⚖️"}
            </h2>
            <p>
              {activeTab === "autorizados"
                ? "Listado de empleados con permisos aprobados activos"
                : activeTab === "pendientes"
                ? "Solicitudes que requieren revisión y decisión"
                : "Marco legal colombiano sobre permisos laborales"}
            </p>
          </div>

          <div className="content-area">
            {activeTab === "autorizados" ? (
              <AuthorizedList onAction={handleAction} searchTerm={searchTerm} />
            ) : activeTab === "pendientes" ? (
              <PendingRequests onAction={handleAction} searchTerm={searchTerm} />
            ) : (
              // INFORMACIÓN LEGAL
              <div className="legal-grid">
                {legalInfo.map((info, index) => (
                  <div key={index} className="legal-card">
                    <div className="legal-header">
                      <h3 className="legal-type">{info.tipo}</h3>
                      <div className="legal-days">{info.dias}</div>
                    </div>
                    <div className="legal-body">
                      <p className="legal-law">📜 {info.ley}</p>
                      <p className="legal-desc">{info.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACTIVIDAD RECIENTE - No mostrar en sección legal */}
          {activeTab !== "legal" && (
            <div className="activity-panel">
              <h3>🕒 Actividad Reciente</h3>
              <ul>
                {activityLog.map((log, index) => (
                  <li key={index}>{log}</li>
                ))}
              </ul>
            </div>
          )}

          {/* DISCLAIMER LEGAL */}
          {activeTab === "legal" && (
            <div className="legal-disclaimer">
              <p>
                ⚠️ <strong>Nota importante:</strong> Esta información es de carácter informativo y se basa en la legislación colombiana vigente. 
                Para casos específicos, consulte con el departamento de recursos humanos o asesoría legal de su organización.
              </p>
            </div>
          )}
        </main>

        {/* MODAL */}
        {modal.open && (
          <div
            className="modal-overlay"
            onClick={() => setModal({ open: false })}
          >
            <div
              className={`modal ${modal.type}`}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>
                {modal.type === "approve"
                  ? "✅ Aprobado"
                  : modal.type === "reject"
                  ? "❌ Rechazado"
                  : "🗑️ Eliminado"}
              </h3>
              <p>{modal.message}</p>
              <button onClick={() => setModal({ open: false })}>Cerrar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PanelAdmin;