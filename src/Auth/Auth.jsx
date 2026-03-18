import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';

export default function Auth({ onLogin }) {
  const [view, setView] = useState('login');

  // New: This background covers the whole screen
  const screenBackgroundStyle = {
    height: '100vh',
    width: '100vw',
    backgroundColor: '#f8fafc', // Very light gray background
    display: 'flex',
    alignItems: 'center', // Centers vertically
    justifyContent: 'center', // Centers horizontally
    fontFamily: "'Inter', sans-serif"
  };

  // New: This is the decent-sized "box" the form lives in
  const mainFormBoxStyle = {
    width: '900px', // Decent size
    maxWidth: '95%', // Good for smaller screens
    height: '600px', // Good fixed height
    display: 'flex',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)', // Nice shadow
    borderRadius: '20px', // Rounded corners for the whole box
    overflow: 'hidden' // Keeps the inner panels rounded
  };

  // The Left Panel (Dark) now stays inside the box
  const leftPanelStyle = {
    flex: 1, // 50% width of the box
    backgroundColor: '#3b1e0d', // Dark brown
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '60px',
  };

  // The Right Panel (White) now stays inside the box
  const rightPanelStyle = {
    flex: 1, // 50% width of the box
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '60px',
  };

  return (
    <div style={screenBackgroundStyle}>
      {/* This is the new centralized form box */}
      <div style={mainFormBoxStyle}>
        
        {/* LEFT PANEL: Logo and Welcome Text */}
        <div style={leftPanelStyle}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
            <span style={{ fontSize: '30px' }}>🌱</span>
            <span style={{ letterSpacing: '2px', fontWeight: 'bold' }}>FIELDSIGHT</span>
          </div>
          {/* Large Text */}
          <h1 style={{ fontSize: '60px', fontWeight: '900', lineHeight: '1.1', marginTop: '0' }}>
            {view === 'login' ? 'WELCOME BACK.' : 'GROW WITH US.'}
          </h1>
        </div>

        {/* RIGHT PANEL: The Form (Login or Signup) */}
        <div style={rightPanelStyle}>
          {view === 'login' ? (
            <Login onLogin={onLogin} onGoToSignup={() => setView('signup')} />
          ) : (
            <Signup onGoToLogin={() => setView('login')} />
          )}
        </div>
        
      </div>
    </div>
  );
}