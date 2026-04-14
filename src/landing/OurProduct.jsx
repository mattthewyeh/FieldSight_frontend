import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';

export default function OurProduct({ setView, onLoginClick }) {
  return (
    <div className="landing-wrapper">
      <Header setView={setView} onLoginClick={onLoginClick} />
      <main className="landing-main">
        <h1 className="hero-title">Our Flagship Solution</h1>
        
        <div className="info-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <img src="/src/landing/images/solution.jpg" alt="Rover" className="full-width-img" />
          <p className="card-text" style={{ marginTop: '20px' }}>
            Our flagship solution is an autonomous rover designed specifically for precision 
            monitoring in the field. The FieldSight rover acts as a farmer’s "eyes on the ground," 
            providing a level of detail that traditional scouting simply can't match.
          </p>
          
          <ul className="solution-list">
            <li><strong>Autonomous Navigation:</strong> The rover seamlessly moves down rows of tomato crops without the need for constant human supervision.</li>
            <li><strong>AI-Powered Vision:</strong> Using advanced camera vision and trained AI models, the rover analyzes plant health in real-time.</li>
            <li><strong>Instant Signal Transmission:</strong> When a threat is detected, the rover immediately pings its location to a centralized system.</li>
            <li><strong>Precision Mapping Interface:</strong> Farmers can access a digital map of their field that highlights exactly which crops are showing signs of distress.</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}