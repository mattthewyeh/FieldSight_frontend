import React from 'react';

const StatCard = ({ title, image, children }) => {
  return (
    <div className="stat-card">
      <h3 className="stat-title">{title}</h3>
      <div className="stat-image-container">
        <img src={image} alt={title} className="stat-image" />
      </div>
      <div className="stat-content">
        {children}
      </div>
    </div>
  );
};

export default StatCard;