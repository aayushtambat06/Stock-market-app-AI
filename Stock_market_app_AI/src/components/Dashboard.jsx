import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Expanded list with a 'popular' flag to separate the top section
const initialStocks = [
  { ticker: 'AAPL', name: 'Apple Inc.', price: 0, change: 0, popular: true },
  { ticker: 'NVDA', name: 'NVIDIA Corp.', price: 0, change: 0, popular: true },
  { ticker: 'TSLA', name: 'Tesla Inc.', price: 0, change: 0, popular: true },
  { ticker: 'MSFT', name: 'Microsoft Corp.', price: 0, change: 0, popular: true },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', price: 0, change: 0, popular: false },
  { ticker: 'AMZN', name: 'Amazon.com', price: 0, change: 0, popular: false },
  { ticker: 'META', name: 'Meta Platforms', price: 0, change: 0, popular: false },
  { ticker: 'NFLX', name: 'Netflix Inc.', price: 0, change: 0, popular: false },
  { ticker: 'AMD', name: 'Advanced Micro Devices', price: 0, change: 0, popular: false }
];

const Dashboard = () => {
  const [stocks, setStocks] = useState(initialStocks);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch Real Data
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const updatedStocks = await Promise.all(initialStocks.map(async (stock) => {
          const response = await fetch(`http://localhost:5000/api/stock/${stock.ticker}`);
          const data = await response.json();
          
          return {
            ...stock,
            price: data.c || 0,     
            change: (data.dp || 0).toFixed(2) 
          };
        }));

        setStocks(updatedStocks);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching real stock data:", error);
        setIsLoading(false);
      }
    };

    fetchRealData();
  }, []);

  // Filter based on search
  const filteredStocks = stocks.filter(stock => 
    stock.ticker.toLowerCase().includes(searchTerm.toLowerCase()) || 
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Split into Popular vs All (Only show popular if user isn't searching)
  const popularStocks = filteredStocks.filter(stock => stock.popular);

  const handleViewDetails = (ticker) => {
    navigate(`/details/${ticker}`);
  };

  return (
    <main style={{ padding: '3rem 4rem', width: '100%', boxSizing: 'border-box', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Top Header & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '2rem', color: '#1a1a1a', fontWeight: '800' }}>Market Overview</h3>
          <p style={{ margin: '5px 0 0 0', color: '#888', fontSize: '0.95rem' }}>
            {isLoading ? 'Fetching live market data...' : 'Live data from Finnhub'}
          </p>
        </div>
        
        <input 
          type="text" 
          className="search-input"
          placeholder="🔍 Search ticker or company..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* SECTION 1: Popular Stocks (Cards) - Only hide this if they are searching for something specific */}
      {searchTerm === '' && (
        <div style={{ marginBottom: '3rem' }}>
          <h4 style={{ margin: '0 0 1.5rem 0', color: '#2c3e50', fontSize: '1.2rem' }}>🔥 Popular Right Now</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
            {popularStocks.map((stock) => {
              const isProfit = stock.change >= 0;
              const accentColor = isProfit ? '#10b981' : '#ef4444';
              const bgColor = isProfit ? '#ecfdf5' : '#fef2f2';
              
              return (
                <div key={`pop-${stock.ticker}`} className={`stock-card ${isProfit ? 'profit' : 'loss'}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.4rem', color: '#1a1a1a', letterSpacing: '-0.5px' }}>{stock.ticker}</h4>
                      <span style={{ fontSize: '0.9rem', color: '#888', fontWeight: '500' }}>{stock.name}</span>
                    </div>
                    <div style={{ backgroundColor: bgColor, color: accentColor, padding: '0.3rem 0.8rem', borderRadius: '20px', fontWeight: '700', fontSize: '0.85rem' }}>
                      {isProfit ? '▲' : '▼'} {Math.abs(stock.change)}%
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1rem' }}>
                    <h2 style={{ margin: 0, fontSize: '2.2rem', color: '#1a1a1a', letterSpacing: '-1px' }}>
                      {isLoading ? '...' : `$${Number(stock.price).toFixed(2)}`}
                    </h2>
                    <button className="btn-view" onClick={() => handleViewDetails(stock.ticker)}>View</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: All Stocks (Table Layout) */}
      <div>
        <h4 style={{ margin: '0 0 1.5rem 0', color: '#2c3e50', fontSize: '1.2rem' }}>
          {searchTerm === '' ? '📋 All Assets' : `Search Results for "${searchTerm}"`}
        </h4>
        
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', color: '#888', textTransform: 'uppercase', fontSize: '0.8rem', borderBottom: '1px solid #f0f0f0' }}>
                <th style={{ padding: '1.2rem 1.5rem' }}>Asset</th>
                <th style={{ padding: '1.2rem 1.5rem' }}>Company</th>
                <th style={{ padding: '1.2rem 1.5rem' }}>Price</th>
                <th style={{ padding: '1.2rem 1.5rem' }}>24h Change</th>
                <th style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.map((stock) => {
                const isProfit = stock.change >= 0;
                const accentColor = isProfit ? '#10b981' : '#ef4444';
                
                return (
                  <tr key={`all-${stock.ticker}`} style={{ borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fefefe'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '1.2rem 1.5rem', fontWeight: '700', color: '#2c3e50' }}>{stock.ticker}</td>
                    <td style={{ padding: '1.2rem 1.5rem', color: '#666', fontWeight: '500' }}>{stock.name}</td>
                    <td style={{ padding: '1.2rem 1.5rem', fontWeight: '700', color: '#1a1a1a' }}>
                      {isLoading ? '...' : `$${Number(stock.price).toFixed(2)}`}
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem', fontWeight: '700', color: accentColor }}>
                      {isProfit ? '▲ +' : '▼ '}{stock.change}%
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleViewDetails(stock.ticker)}
                        style={{ background: 'transparent', color: '#3498db', border: '1px solid #3498db', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </main>
  );
};

export default Dashboard;