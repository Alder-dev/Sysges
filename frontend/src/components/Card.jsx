import React from "react";
import "../styles/Card.css";

const Card = ({ title, text, icon, onClick }) => {
  return (
    <div className="card" onClick={onClick}>
      <div className="icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
};

export default Card;
