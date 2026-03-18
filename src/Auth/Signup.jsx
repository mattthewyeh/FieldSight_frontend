import React from 'react';
import { User, MapPin, ShieldCheck, AtSign } from 'lucide-react';

export default function Signup({ onGoToLogin }) {
  const inputGroupStyle = { position: 'relative', marginBottom: '15px' };
  
  const inputStyle = {
    width: '100%',
    padding: '14px 14px 14px 45px',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    border: 'none',
    fontSize: '15px',
    color: '#334155',
    boxSizing: 'border-box'
  };

  const iconStyle = {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
  };

  const buttonStyle = {
    width: '100%',
    padding: '16px',
    backgroundColor: '#020617',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '10px'
  };

  return (
    <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginBottom: '10px' }}>JOIN US</h2>
      <p style={{ color: '#64748b', marginBottom: '30px', fontSize: '14px' }}>Register your farm to start monitoring.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Row for Names */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
                <User style={iconStyle} size={18} />
                <input type="text" placeholder="First Name" style={inputStyle} />
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
                <input type="text" placeholder="Last Name" style={{...inputStyle, paddingLeft: '15px'}} />
            </div>
        </div>

        <div style={inputGroupStyle}>
          <MapPin style={iconStyle} size={18} />
          <input type="text" placeholder="Farm Name" style={inputStyle} />
        </div>

        <div style={inputGroupStyle}>
          <AtSign style={iconStyle} size={18} />
          <input type="text" placeholder="Username" style={inputStyle} />
        </div>
        
        <div style={inputGroupStyle}>
          <ShieldCheck style={iconStyle} size={18} />
          <input type="password" placeholder="Password" style={inputStyle} />
        </div>
        
        {/* Updated Button with onClick handler */}
        <button 
          onClick={onGoToLogin} 
          style={buttonStyle}
        >
          CREATE ACCOUNT →
        </button>
      </div>
      
      <p style={{ marginTop: '25px', textAlign: 'center', fontSize: '14px', color: '#64748b', fontWeight: 'bold' }}>
        ALREADY A MEMBER? <span onClick={onGoToLogin} style={{ color: '#166534', cursor: 'pointer' }}>LOGIN</span>
      </p>
    </div>
  );
}