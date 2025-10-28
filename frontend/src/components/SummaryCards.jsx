import React from "react";
import "../styles/PanelAdmin.css";

function SummaryCards() {
  const stats = [
    { title: "Vacaciones", count: 14, icon: "🌴" },
    { title: "Maternidad", count: 126, icon: "🤱" },
    { title: "Paternidad", count: 11, icon: "👨‍👧" },
    { title: "Incapacidad", count: 17, icon: "🏥" },
  ];

  return (
    <div className="summary-cards">
      {stats.map((s, i) => (
        <div key={i} className="summary-card">
          <div className="icon">{s.icon}</div>
          <div>
            <h3>{s.title}</h3>
            <p>{s.count} días</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SummaryCards;
