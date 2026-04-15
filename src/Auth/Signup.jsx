import React, { useState } from 'react';
import { User, MapPin, ShieldCheck, AtSign, ArrowRight, Loader2 } from 'lucide-react';

export default function Signup({ onGoToLogin }) {
  const API_URL = import.meta.env.VITE_API_URL || "https://api.fieldsightproject.com ";


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
    textGrey: '#4A4A4A',
    white: '#FFFFFF'
  };

  const handleChange = (e) => {
    // This connects the 'name' attribute in the HTML to the 'formData' state
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Mapping React state keys to the Python backend's expected snake_case keys
    const signupData = {
      firstName: formData.firstName.trim(), 
      lastName: formData.lastName.trim(),   
      username: formData.username.trim(),
      password: formData.password,
      farmName: formData.farmName.trim()
    };

    const targetUrl = `${API_URL}/api/auth/signup`;

    try {
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (response.ok) {
        onGoToLogin(); 
      } else {
        // This parses the specific error from FastAPI to tell you EXACTLY what field failed
        if (response.status === 422 && Array.isArray(data.detail)) {
            const field = data.detail[0].loc[1];
            const msg = data.detail[0].msg;
            setError(`Format Error in ${field}: ${msg}`);
        } else {
            setError(data.detail || "Registration failed. Please check your inputs.");
        }
      }
    } catch (err) {
      setError(`Connection Failed: Backend unreachable at ${API_URL}`);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 12px 12px 42px', backgroundColor: '#F9FAF8',
    borderRadius: '6px', border: '1px solid #DDD', fontSize: '15px', color: theme.darkBrown, boxSizing: 'border-box', outline: 'none'
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, height: '100vh', width: '100vw', backgroundColor: theme.sageGreen, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ backgroundColor: theme.white, padding: '40px', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', width: '100%', maxWidth: '450px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '32px', color: theme.darkBrown, marginBottom: '8px', fontWeight: 'bold' }}>Join FieldSight</h2>
        <p style={{ color: theme.textGrey, marginBottom: '25px', fontSize: '14px' }}>Register your farm to start monitoring.</p>
        
        {error && (
          <div style={{ color: '#D32F2F', backgroundColor: '#FFEBEE', padding: '12px', borderRadius: '6px', marginBottom: '15px', fontSize: '13px', fontWeight: 'bold', textAlign: 'left', border: '1px solid #D32F2F' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Row 1: Name */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: theme.sageGreen }} size={18} />
              <input name="firstName" type="text" placeholder="First Name" required style={inputStyle} onChange={handleChange} />
            </div>
            <div style={{ flex: 1 }}>
              {/* FIXED: Added name="lastName" here */}
              <input name="lastName" type="text" placeholder="Last Name" required style={{...inputStyle, paddingLeft: '15px'}} onChange={handleChange} />
            </div>
          </div>

          {/* Row 2: Farm */}
          <div style={{ position: 'relative', marginBottom: '15px' }}>
            <MapPin style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: theme.sageGreen }} size={18} />
            <input name="farmName" type="text" placeholder="Farm Name" required style={inputStyle} onChange={handleChange} />
          </div>

          {/* Row 3: Username */}
          <div style={{ position: 'relative', marginBottom: '15px' }}>
            <AtSign style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: theme.sageGreen }} size={18} />
            <input name="username" type="text" placeholder="Username (3-20 chars)" required style={inputStyle} onChange={handleChange} />
          </div>
          
          {/* Row 4: Password */}
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <ShieldCheck style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: theme.sageGreen }} size={18} />
            <input name="password" type="password" placeholder="Password (min 8 chars)" required style={inputStyle} onChange={handleChange} />
          </div>
          
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', backgroundColor: theme.darkBrown, color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            {loading ? <Loader2 className="animate-spin" /> : <>CREATE ACCOUNT <ArrowRight size={20} /></>}
          </button>
        </form>
        
        <p style={{ marginTop: '25px', fontSize: '14px', color: theme.textGrey }}>
          ALREADY A MEMBER? <span onClick={onGoToLogin} style={{ color: theme.darkBrown, cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>LOGIN</span>
        </p>
      </div>
    </div>
  );
}