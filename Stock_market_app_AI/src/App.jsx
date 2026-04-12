import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import StockDetails from './components/stockDetails'; // We will create this next!
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh', margin: 0 }}>
        
        {/* Navigation Bar - Stays on every page and sticks to the top */}
<header style={{ 
  backgroundColor: '#2c3e50', 
  color: 'white', 
  padding: '1.2rem 3rem', 
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  position: 'sticky', /* This is the magic property */
  top: 0,             /* Tells it to stick exactly to the top edge */
  zIndex: 1000        /* Ensures it hovers ABOVE the cards when scrolling */
}}>
  <h2 style={{ margin: 0, fontWeight: '700' }}>MarketDash</h2>
</header>

        {/* Page Routing */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/details/:ticker" element={<StockDetails />} />
        </Routes>
        
      </div>
    </BrowserRouter>
  );
}

export default App;