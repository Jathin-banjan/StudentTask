import React from 'react';
import Dashboard from './pages/Dashboard';

/**
 * App Component - Root Application Component
 * 
 * Sets up main application layout and mounts the student productivity Dashboard.
 */
function App() {
  return (
    <div className="app-root">
      <Dashboard />
    </div>
  );
}

export default App;
