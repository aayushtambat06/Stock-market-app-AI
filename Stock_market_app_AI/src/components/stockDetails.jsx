import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

// Simple map for company names since Finnhub's free quote API only returns tickers
const companyNames = {
  'AAPL': 'Apple Inc.', 'MSFT': 'Microsoft Corp.', 'GOOGL': 'Alphabet Inc.', 
  'AMZN': 'Amazon.com', 'TSLA': 'Tesla Inc.', 'NVDA': 'NVIDIA Corp.',
  'META': 'Meta Platforms', 'NFLX': 'Netflix Inc.', 'AMD': 'Advanced Micro Devices'
};

const StockDetails = () => {
  const { ticker } = useParams(); 
  const navigate = useNavigate();
  
  const [quoteData, setQuoteData] = useState(null);
  const [chartDataState, setChartDataState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        // Fetch current price and historical data at the same time
        const [quoteRes, historyRes] = await Promise.all([
          fetch(`http://localhost:5000/api/stock/${ticker}`),
          fetch(`http://localhost:5000/api/history/${ticker}`)
        ]);

        const quote = await quoteRes.json();
        const history = await historyRes.json();

        setQuoteData(quote);

        // Process Finnhub history data (Finnhub returns status 'ok' if data exists)
        if (history.s === 'ok') {
          // Convert Unix timestamps (history.t) to readable dates for the X-axis
          const dates = history.t.map(timestamp => {
            const date = new Date(timestamp * 1000);
            return `${date.getMonth() + 1}/${date.getDate()}`;
          });
          
          // history.c contains the closing prices for the Y-axis
          setChartDataState({ labels: dates, prices: history.c });
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchStockData();
  }, [ticker]);

  if (isLoading) {
    return <main style={{ padding: '3rem', textAlign: 'center' }}><h2>Loading market data...</h2></main>;
  }

  const isProfit = quoteData.dp >= 0;
  const accentColor = isProfit ? '#10b981' : '#ef4444';
  const bgColor = isProfit ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';

  // Configure Chart.js with the real data
  const chartConfig = {
    labels: chartDataState ? chartDataState.labels : [],
    datasets: [{
      label: 'Closing Price',
      data: chartDataState ? chartDataState.prices : [],
      borderColor: accentColor,
      backgroundColor: bgColor,
      borderWidth: 3,
      pointBackgroundColor: accentColor,
      pointRadius: 4,
      fill: true,
      tension: 0.4
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#f0f0f0' }, ticks: { callback: (value) => '$' + value } }
    }
  };

  return (
    <main style={{ padding: '3rem 4rem', width: '100%', boxSizing: 'border-box', maxWidth: '1200px', margin: '0 auto' }}>
      <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1rem', padding: '0 0 2rem 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
        ← Back to Dashboard
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '3rem', color: '#1a1a1a', letterSpacing: '-1px' }}>{companyNames[ticker] || ticker}</h1>
          <span style={{ fontSize: '1.2rem', color: '#888', fontWeight: '600' }}>{ticker}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ margin: 0, fontSize: '3rem', color: '#1a1a1a', letterSpacing: '-1px' }}>${quoteData.c.toFixed(2)}</h2>
          <span style={{ fontSize: '1.2rem', color: accentColor, fontWeight: '700' }}>
            {isProfit ? '▲ +' : '▼ '}{quoteData.dp.toFixed(2)}%
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#2c3e50' }}>Price History (Last 14 Days)</h3>
          <div style={{ height: '400px' }}>
            {chartDataState ? <Line data={chartConfig} options={chartOptions} /> : <p>Historical data not available for this asset.</p>}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#2c3e50' }}>Today's Statistics</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#888', fontWeight: '500' }}>Open</span>
              <span style={{ fontWeight: '700', color: '#1a1a1a' }}>${quoteData.o.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#888', fontWeight: '500' }}>High</span>
              <span style={{ fontWeight: '700', color: '#1a1a1a' }}>${quoteData.h.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#888', fontWeight: '500' }}>Low</span>
              <span style={{ fontWeight: '700', color: '#1a1a1a' }}>${quoteData.l.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#888', fontWeight: '500' }}>Prev Close</span>
              <span style={{ fontWeight: '700', color: '#1a1a1a' }}>${quoteData.pc.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default StockDetails;