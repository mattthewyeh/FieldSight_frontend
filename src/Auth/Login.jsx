import React, { useState } from 'react';
import { User, Lock, ArrowRight, Loader2, ShieldAlert } from 'lucide-react';

export default function Login({ onLogin, onGoToSignup }) {
  // 1. DYNAMIC API URL
  const BASE_URL = import.meta.env.VITE_API_URL || "https://api.fieldsightproject.com";

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const theme = {
    sageGreen: '#A3B18A',
    darkBrown: '#3E2723',
    cardWhite: '#FFFFFF'
  };

  const handleLoginClick = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Logic: Sending camelCase to match your working Signup flow
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: username.trim(), 
          password: password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // SUCCESS
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("farmerId", data.farmerId); // camelCase here too if backend sends it
        
        onLogin({ lng: -121.88107, lat: 37.33332 }); 
      } else {
        // ERROR DIAGNOSTICS
        if (response.status === 401) {
          setError("Invalid username or password.");
        } else if (response.status === 422 && data.detail) {
          // Field validation error (using camelCase for display)
          const field = data.detail[0]?.loc[1] || "input";
          setError(`Format Error: The ${field} field is invalid.`);
        } else {
          setError(data.detail || "Login failed. Please try again.");
        }
      }
    } catch (err) {
      // This tells us if it's a DNS/URL issue
      setError(`Connection Failed: Cannot reach ${BASE_URL}.`);
      console.error("Login Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- STYLES ---
  const containerStyle = {
    position: 'fixed', top: 0, left: 0, height: '100vh', width: '100vw',
    backgroundColor: theme.sageGreen, display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontFamily: "'Inter', sans-serif", margin: 0, padding: 0, zIndex: 1000
  };

  const cardStyle = {
    backgroundColor: theme.cardWhite, padding: '50px', borderRadius: '12px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)', width: '100%', maxWidth: '400px', textAlign: 'center'
  };

  const inputStyle = { 
    width: '100%', padding: '14px 14px 14px 45px', marginBottom: '15px',
    borderRadius: '6px', border: '1px solid #DDD', fontSize: '16px', boxSizing: 'border-box', outline: 'none'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ color: theme.darkBrown, fontSize: '32px', marginBottom: '10px', fontWeight: '800' }}>Login</h2>
        <p style={{ color: '#666', marginBottom: '30px', fontSize: '14px' }}>Welcome back to FieldSight</p>
        
        {error && (
          <div style={{ 
            backgroundColor: '#FEE2E2', color: '#991B1B', padding: '12px', 
            borderRadius: '6px', marginBottom: '20px', fontSize: '13px', 
            display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left',
            border: '1px solid #FECACA', fontWeight: 'bold'
          }}>
            <ShieldAlert size={16} style={{ flexShrink: 0 }} /> <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLoginClick}>
          <div style={{ position: 'relative' }}>
            <User style={{ position: 'absolute', left: '15px', top: '15px', color: theme.sageGreen }} size={18} />
            <input 
              type="text" 
              placeholder="Username" 
              required
              style={inputStyle} 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          <div style={{ position: 'relative' }}>
            <Lock style={{ position: 'absolute', left: '15px', top: '15px', color: theme.sageGreen }} size={18} />
            <input 
              type="password" 
              placeholder="Password" 
              required
              style={inputStyle} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '16px', backgroundColor: loading ? '#6d4c41' : theme.darkBrown,
              color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '16px'
            }}>
            {loading ? <Loader2 className="animate-spin" /> : <>ENTER FIELD <ArrowRight size={18} /></>}
          </button>
        </form>

        <p style={{ marginTop: '25px', fontSize: '14px', color: '#444', fontWeight: '500' }}>
          NEW HERE? <span onClick={onGoToSignup} style={{ color: theme.darkBrown, cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>JOIN US</span>
        </p>
      </div>
    </div>
  );
}