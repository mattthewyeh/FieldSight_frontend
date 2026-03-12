import React from 'react';
import { Activity, Battery, Map } from 'lucide-react'; // We'll use these for icons!

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <h2>Command Center</h2>
      
      <div className="stats-grid">
        {/* We will put our rover data cards here soon! */}
        <div className="card">
          <Battery />
          <p>Battery: 85%</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;