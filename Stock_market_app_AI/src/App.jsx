import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import StockDetails from './components/stockDetails';
import Chatbot from './Chatbot';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div style={{ 
        fontFamily: 'Inter, sans-serif', 
        backgroundColor: '#f4f7f6', 
        minHeight: '100vh', 
        margin: 0 
      }}>
        
        {/* Navbar */}
        <header style={{ 
          backgroundColor: '#2c3e50', 
          color: 'white', 
          padding: '1.2rem 3rem', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}>
          <h2 style={{ margin: 0, fontWeight: '700' }}>MarketDash</h2>
        </header>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/details/:ticker" element={<StockDetails />} />
        </Routes>

        {/* Chatbot (IMPORTANT: inside App) */}
        <Chatbot />

      </div>
    </BrowserRouter>
  );
}

export default App;