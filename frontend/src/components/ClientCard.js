import React, { useState } from 'react';
import './ClientCard.css';
import { abbreviateNumber } from '../utils/formatters';
import Sparkline from './Sparkline';

const StatNumber = ({ value, label, colorClass }) => {
    const [isHovered, setIsHovered] = useState(false);

    const displayValue = isHovered ? new Intl.NumberFormat().format(value) : abbreviateNumber(value);

    return (
        <div className="stat-item">
            <span className="stat-label">{label}</span>
            <span 
                className={`stat-value ${colorClass} ${isHovered ? 'full' : 'abbreviated'}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {displayValue}
            </span>
        </div>
    );
};


const ClientCard = ({ client, logStats = { total: 0, major: 0, normal: 0 }, history = [] }) => {
  
  const openDashboard = () => {
    window.open(client.url, "_blank");
  };

  const getStatus = () => {
    if (logStats.major > 100) return 'danger';
    if (logStats.major > 0) return 'warning';
    return 'healthy';
  }

  return (
    <div className={`client-card status-${getStatus()}`} onClick={openDashboard}>
      <div className="status-stripe"></div>
      
      {/* Section 1: Identity */}
      <div className="card-section identity-section">
        <div className="client-icon">
          {client.name.charAt(0).toUpperCase()}
        </div>
        <div className="client-info">
          <h3 className="client-name">{client.name}</h3>
          <p className="client-url">{client.url}</p>
        </div>
        <p className="client-description">{client.description || "No description provided."}</p>
      </div>
      
      {/* Section 2: Key Metrics */}
      <div className="card-section metrics-section">
        <StatNumber value={logStats.total} label="Total Logs" colorClass="total-logs-color" />
        <StatNumber value={logStats.major} label="Major Alerts" colorClass="major-logs-color" />
        <StatNumber value={logStats.normal} label="Normal Logs" colorClass="normal-logs-color" />
      </div>

      {/* Section 3: Graph */}
      <div className="card-section graph-section">
          <Sparkline history={history} />
          <div className="graph-labels">
            <span>-120s</span>
            <span>Now</span>
          </div>
      </div>
    </div>
  );
};

export default ClientCard;
