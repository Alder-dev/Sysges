import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="navbar">
      <button className="logout-btn" onClick={() => navigate("/login")}>
        ⎋ Cerrar Sesión
      </button>
    </nav>
  );
};

export default Navbar;
