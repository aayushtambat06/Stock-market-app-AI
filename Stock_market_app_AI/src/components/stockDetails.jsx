import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

const companyNames = {
  AAPL: "Apple Inc.",
  MSFT: "Microsoft Corp.",
  GOOGL: "Alphabet Inc.",
  AMZN: "Amazon",
  TSLA: "Tesla",
  NVDA: "NVIDIA",
  META: "Meta",
  NFLX: "Netflix",
  AMD: "AMD",
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
        const BASE_URL = import.meta.env.VITE_API_URL;

        const [quoteRes, historyRes] = await Promise.all([
          fetch(`${BASE_URL}/api/stock/${ticker}`),
          fetch(`${BASE_URL}/api/history/${ticker}`),
        ]);

        const quote = await quoteRes.json();
        const history = await historyRes.json();

        setQuoteData(quote);

        if (history.s === "ok" && history.t.length > 0) {
          const dates = history.t.map((timestamp) => {
            const date = new Date(timestamp * 1000);
            return `${date.getMonth() + 1}/${date.getDate()}`;
          });

          setChartDataState({
            labels: dates,
            prices: history.c,
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Fetch Error:", error);
        setIsLoading(false);
      }
    };

    fetchStockData();

    const interval = setInterval(fetchStockData, 5000);

    return () => clearInterval(interval);
  }, [ticker]);

  if (isLoading) {
    return <h2 style={{ textAlign: "center" }}>Loading...</h2>;
  }

  if (!quoteData || !quoteData.c) {
    return <h2 style={{ textAlign: "center" }}>No data available</h2>;
  }

  const isProfit = quoteData.dp >= 0;
  const color = isProfit ? "green" : "red";

  const chartData = {
    labels: chartDataState?.labels || [],
    datasets: [
      {
        data: chartDataState?.prices || [],
        borderColor: color,
        backgroundColor: "rgba(0,0,0,0.05)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => navigate("/")}>← Back</button>

      <h1>{companyNames[ticker] || ticker}</h1>

      <h2>
        ${quoteData.c.toFixed(2)}{" "}
        <span style={{ color }}>
          ({quoteData.dp.toFixed(2)}%)
        </span>
      </h2>

      <div style={{ height: "300px" }}>
        <Line data={chartData} />
      </div>

      <p>Open: ${quoteData.o.toFixed(2)}</p>
      <p>High: ${quoteData.h.toFixed(2)}</p>
      <p>Low: ${quoteData.l.toFixed(2)}</p>
      <p>Prev Close: ${quoteData.pc.toFixed(2)}</p>
    </div>
  );
};

export default StockDetails;