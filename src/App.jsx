import React, { useState } from 'react';
import LandingPage from './landing/LandingPage';
import Auth from './Auth/Auth';
import Dashboard from './Dashboard'; 

export default function App() {
  // 'landing' is the default view for fieldsightproject.com
  const [currentView, setCurrentView] = useState('landing');
  
  // Default coordinates (San Jose area fallback)
  const [farmLocation, setFarmLocation] = useState({ lng: -121.88107, lat: 37.33332 });

  // Called when Login.jsx successfully gets an access_token from /auth/login
  const handleLoginSuccess = (coords) => {
    if (coords) {
      setFarmLocation(coords);
    }
    setCurrentView('dashboard'); 
  };

  // Resets the view and clears local state on logout
  const handleLogout = () => {
    localStorage.removeItem("token"); // Clean up the session token
    setCurrentView('landing'); 
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      margin: 0,
      padding: 0,
      overflowX: 'hidden' 
    }}>
      
      {/* 1. LANDING PAGE - Default Entry Point */}
      {currentView === 'landing' && (
        <LandingPage onLoginClick={() => setCurrentView('login')} />
      )}

      {/* 2. AUTHENTICATION VIEW (Login/Signup) */}
      {currentView === 'login' && (
        <Auth 
          onLoginSuccess={handleLoginSuccess} 
          onBack={() => setCurrentView('landing')} 
        />
      )}

      {/* 3. DASHBOARD VIEW - Protected View */}
      {currentView === 'dashboard' && (
        <Dashboard 
          onLogout={handleLogout} 
          farmCoords={farmLocation} 
        />
      )}

    </div>
  );
}