import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Dashboard from './Dashboard';

function App() {
  // We initialize it to false because the session hasn't started yet
  const [isSessionActive, setIsSessionActive] = useState(false);
  const handleStartSession = () => {
  setIsSessionActive(true); 
};

  return (
  <div className="app-container">
    {isSessionActive ? (
      <Dashboard />
    ) : (
      <div className="start-screen">
        <button onClick={handleStartSession} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">
          Start Session
        </button>
      </div>
    )}
  </div>
);
}

export default App
