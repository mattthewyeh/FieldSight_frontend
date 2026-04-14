import React from 'react';

const LandingPage = ({ onLoginClick }) => {
  const theme = {
    sageGreenBg: '#acc0a4',    // The exact green you uploaded
    pastelBrown: '#d7c0ae',    // Header & footer brown
    darkBrownText: '#3e322b',  // Text color
  };

  return (
    <div style={{ 
      backgroundColor: theme.sageGreenBg, 
      minHeight: '100vh', 
      width: '100%',
      margin: 0,
      padding: 0,
      color: theme.darkBrownText, 
      fontFamily: "'Inter', sans-serif"
    }}>
      
      {/* --- HEADER --- */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        padding: '12px 5%', 
        alignItems: 'center',
        backgroundColor: theme.pastelBrown,
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
          FieldSight <span style={{ color: '#5e6b56' }}>Project</span>
        </div>
        <nav style={{ display: 'flex', gap: '30px' }}>
          {['Home', 'About Us', 'Our Product'].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(' ', '')}`} style={{ textDecoration: 'none', color: theme.darkBrownText, fontWeight: '600', fontSize: '14px' }}>
              {item}
            </a>
          ))}
        </nav>
        <button onClick={onLoginClick} style={{ backgroundColor: theme.darkBrownText, color: '#fff', padding: '8px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
          Client Login
        </button>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', padding: '30px 5%', boxSizing: 'border-box' }}>
        
        {/* HERO SECTION */}
        <section id="home" style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '20px', fontWeight: '800' }}>
            Welcome to FieldSight Project
          </h1>
          <div style={{ borderRadius: '15px', overflow: 'hidden', width: '100%', maxHeight: '450px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            <img src="/farmers-tending-crops-stockcake.webp" alt="Farmers" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </section>

        {/* MISSION SECTION (Full Original Text - Smaller Font) */}
        <section id="aboutus" style={{ textAlign: 'center', marginBottom: '60px', padding: '0 5%' }}>
          <h3 style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px', marginBottom: '10px', opacity: 0.8 }}>Our Mission</h3>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700', lineHeight: '1.6', margin: '0 auto' }}>
            At FieldSight, our mission is to empower farmers with real-time, actionable insights through autonomous technology. We strive to safeguard global food security by ensuring that no crop disease goes unnoticed and no harvest is lost to a preventable outbreak.
          </h2>
        </section>

        {/* PURPOSE & SOLUTION GRID (Original Content) */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', marginBottom: '60px' }}>
          <div id="about">
            <h3 style={{ borderBottom: `3px solid ${theme.darkBrownText}`, paddingBottom: '8px', marginBottom: '15px', fontSize: '1.5rem', fontWeight: '800' }}>Purpose</h3>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.7', textAlign: 'justify' }}>
              Agriculture is the backbone of our society, yet farmers still rely heavily on manual field scouting, a process that is both grueling and imperfect. The reality is that manual inspection isn’t fast enough to keep up with the spread of disease. We created FieldSight to provide a timely, automated response.
            </p>
          </div>

          <div id="product">
            <h3 style={{ borderBottom: `3px solid ${theme.darkBrownText}`, paddingBottom: '8px', marginBottom: '15px', fontSize: '1.5rem', fontWeight: '800' }}>Our Solution</h3>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '10px' }}>
              Our flagship solution is an autonomous rover designed specifically for precision monitoring in the field. The FieldSight rover acts as a farmer’s "eyes on the ground," providing detail that traditional scouting can't match.
            </p>
            <ul style={{ paddingLeft: '0', listStyle: 'none', fontSize: '0.95rem', lineHeight: '1.8' }}>
              <li><strong>• Autonomous Navigation:</strong> Moves down rows of tomato crops without human supervision.</li>
              <li><strong>• AI-Powered Vision:</strong> Analyzes plant health in real-time.</li>
              <li><strong>• Instant Transmission:</strong> Pings location immediately upon threat detection.</li>
            </ul>
          </div>
        </section>
      </main>

      <footer style={{ backgroundColor: theme.darkBrownText, color: theme.pastelBrown, padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ fontWeight: 'bold', fontSize: '12px' }}>© 2026 FIELDSIGHT PROJECT</p>
      </footer>

      <style>{`
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; background-color: #acc0a4; }
      `}</style>
    </div>
  );
};

export default LandingPage;