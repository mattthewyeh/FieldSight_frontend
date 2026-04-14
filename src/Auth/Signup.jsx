import React, { useState } from 'react';
import { User, MapPin, ShieldCheck, AtSign, ArrowRight, Loader2 } from 'lucide-react';

export default function Signup({ onGoToLogin }) {
  // Use the env variable or fallback to the direct IP
  const API_URL = import.meta.env.VITE_API_URL || "http://64.181.240.74:8000";

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    farmName: '',
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const theme = {
    sageGreen: '#A3B18A',
    darkBrown: '#3E2723',
    lightTan: '#FAF9F6',
    textGrey: '#4A4A4A',
    white: '#FFFFFF'
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Construct the payload exactly as the backend expects
    const signupData = {
      username: formData.username,
      password: formData.password,
      full_name: `${formData.firstName} ${formData.lastName}`,
      farm_name: formData.farmName
    };

    // Construct the URL to test
    const targetUrl = `${API_URL}/api/auth/signup`;
    console.log("DIAGNOSTIC: Attempting to connect to:", targetUrl);

    try {
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });

      console.log("DIAGNOSTIC: Response Status Code:", response.status);

      if (response.ok) {
        const data = await response.json();
        onGoToLogin();
      } else {
        // --- SPECIFIC ERROR LOGGING FOR THE UI ---
        let diagnosticMsg = `Error ${response.status}: `;

        if (response.status === 404) {
          diagnosticMsg += "Backend Route Missing. The URL is wrong—your server doesn't have an endpoint at /api/auth/signup.";
        } else if (response.status === 422) {
          diagnosticMsg += "Data Format Error. The backend received the request but didn't like your data fields (check if 'full_name' or 'farm_name' is correct).";
        } else if (response.status === 500) {
          diagnosticMsg += "Backend Crash. The server is running but the database might be down or the user table doesn't exist.";
        } else {
          diagnosticMsg += "Unknown Server Error.";
        }

        const errorText = await response.text();
        console.error("DIAGNOSTIC: Full Server Response:", errorText);
        setError(diagnosticMsg);
      }
    } catch (err) {
      // This happens if the server is totally offline or CORS blocks it
      const offlineMsg = `Connection Failed: Cannot reach ${API_URL}. Check if your OCI backend is running and if you used http instead of https.`;
      setError(offlineMsg);
      console.error("DIAGNOSTIC: Network Catch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- STYLES ---
  const containerStyle = {
    position: 'fixed', top: 0, left: 0, height: '100vh', width: '100vw',
    backgroundColor: theme.sageGreen, display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontFamily: "'Inter', sans-serif", zIndex: 1000
  };

  const cardStyle = {
    backgroundColor: theme.white, padding: '40px', borderRadius: '12px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)', width: '100%', maxWidth: '450px', textAlign: 'center'
  };

  const inputStyle = {
    width: '100%', padding: '12px 12px 12px 42px', backgroundColor: '#F9FAF8',
    borderRadius: '6px', border: '1px solid #DDD', fontSize: '15px', color: theme.darkBrown, boxSizing: 'border-box', outline: 'none'
  };

  const iconStyle = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: theme.sageGreen };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ fontSize: '32px', fontFamily: "'Times New Roman', serif", color: theme.darkBrown, marginBottom: '8px' }}>Join FieldSight</h2>
        <p style={{ color: theme.textGrey, marginBottom: '30px', fontSize: '14px' }}>Register your farm to start monitoring.</p>
        
        {/* THE DIAGNOSTIC UI BOX */}
        {error && (
          <div style={{ 
            color: '#D32F2F', 
            backgroundColor: '#FFEBEE', 
            padding: '12px', 
            borderRadius: '6px', 
            marginBottom: '15px', 
            fontSize: '13px', 
            fontWeight: 'bold',
            textAlign: 'left',
            lineHeight: '1.4',
            border: '1px solid #D32F2F'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <User style={iconStyle} size={18} />
              <input name="firstName" type="text" placeholder="First Name" required style={inputStyle} onChange={handleChange} />
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <input name="lastName" type="text" placeholder="Last Name" required style={{...inputStyle, paddingLeft: '15px'}} onChange={handleChange} />
            </div>
          </div>

          <div style={{ position: 'relative', marginBottom: '15px' }}>
            <MapPin style={iconStyle} size={18} />
            <input name="farmName" type="text" placeholder="Farm Name" required style={inputStyle} onChange={handleChange} />
          </div>

          <div style={{ position: 'relative', marginBottom: '15px' }}>
            <AtSign style={iconStyle} size={18} />
            <input name="username" type="text" placeholder="Username" required style={inputStyle} onChange={handleChange} />
          </div>
          
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <ShieldCheck style={iconStyle} size={18} />
            <input name="password" type="password" placeholder="Password" required style={inputStyle} onChange={handleChange} />
          </div>
          
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '16px', backgroundColor: loading ? '#6d4c41' : theme.darkBrown,
            color: theme.white, border: 'none', borderRadius: '6px', fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', marginTop: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
          }}>
            {loading ? <Loader2 className="animate-spin" /> : <>CREATE ACCOUNT <ArrowRight size={20} /></>}
          </button>
        </form>
        
        <p style={{ marginTop: '25px', fontSize: '14px', color: theme.textGrey, fontWeight: '500' }}>
          ALREADY A MEMBER? <span onClick={onGoToLogin} style={{ color: theme.darkBrown, cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>LOGIN</span>
        </p>
      </div>
    </div>
  );
}