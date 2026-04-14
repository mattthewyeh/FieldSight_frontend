const Header = ({ setView, onLoginClick }) => {
  return (
    <header className="landing-header">
      <div className="logo" onClick={() => setView('landing')} style={{cursor: 'pointer'}}>
        FieldSight <span className="logo-accent">Project</span>
      </div>
      
      <nav className="nav-links">
        <span onClick={() => setView('landing')} data-text="Home">Home</span>
        <span onClick={() => setView('about')} data-text="About Us">About Us</span>
        <span onClick={() => setView('product')} data-text="Our Product">Our Product</span>
      </nav>

      <button className="login-btn" onClick={onLoginClick}>Client Login</button>
    </header>
  );
};