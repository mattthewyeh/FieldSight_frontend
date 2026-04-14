import React, { useState } from 'react';
import LandingPage from './landing/LandingPage';
import Auth from './Auth/Auth';
import Dashboard from './Dashboard'; 

export default function App() {
  // We now have three possible views: 'landing', 'login', or 'dashboard'
  const [currentView, setCurrentView] = useState('landing');
  const [farmLocation, setFarmLocation] = useState({ lng: -118.2437, lat: 34.0522 });

  const handleLoginSuccess = (coords) => {
    if (coords) setFarmLocation(coords);
    setCurrentView('dashboard'); // Switch to dashboard on success
  };

  const handleLogout = () => {
    setCurrentView('landing'); // Go back to the very start on logout
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. LANDING PAGE VIEW */}
      {currentView === 'landing' && (
        <LandingPage onLoginClick={() => setCurrentView('login')} />
      )}

      {/* 2. AUTHENTICATION VIEW */}
      {currentView === 'login' && (
        <Auth onLoginSuccess={handleLoginSuccess} />
      )}

      {/* 3. DASHBOARD VIEW */}
      {currentView === 'dashboard' && (
        <Dashboard onLogout={handleLogout} farmCoords={farmLocation} />
      )}

    </div>
  );
}