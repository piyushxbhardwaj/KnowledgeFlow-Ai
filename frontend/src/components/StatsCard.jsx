import React from 'react';

export default function StatsCard({ label, value, icon: Icon, color = '#8B5CF6' }) {
  return (
    <div className="glass-card stat-card">
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
      </div>
      <div className="stat-icon-container">
        <Icon size={24} style={{ color: color }} />
      </div>
    </div>
  );
}
