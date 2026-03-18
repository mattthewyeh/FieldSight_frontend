import React, { useState } from 'react';
import Auth from './Auth/Auth';
// import Dashboard from './Dashboard';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div style={{ margin: 0, padding: 0 }}>
      {!isLoggedIn ? (
        <Auth onLogin={() => setIsLoggedIn(true)} />
      ) : (
        <Dashboard onLogout={() => setIsLoggedIn(false)} />
      )}
    </div>
  );
}