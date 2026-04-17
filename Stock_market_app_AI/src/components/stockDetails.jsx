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
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend
);

const names = {
  AAPL: "Apple Inc.",
  MSFT: "Microsoft Corp.",
  GOOGL: "Alphabet Inc.",
  AMZN: "Amazon",
  TSLA: "Tesla",
  NVDA: "NVIDIA",
};

export default function StockDetails() {
  const { ticker } = useParams();
  const navigate = useNavigate();

  const [quote, setQuote] = useState(null);
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const BASE = import.meta.env.VITE_API_URL;

        const [qRes, hRes] = await Promise.all([
          fetch(`${BASE}/api/stock/${ticker}`),
          fetch(`${BASE}/api/history/${ticker}`),
        ]);

        const q = await qRes.json();
        const h = await hRes.json();

        setQuote(q);

        if (h.s === "ok") {
          const labels = [];
          const prices = [];

          h.t.forEach((time, i) => {
            const price = h.c[i];

            if (price !== null && price !== undefined) {
              const d = new Date(time * 1000);
              labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
              prices.push(price);
            }
          });

          setChart({
            labels,
            datasets: [
              {
                label: `${ticker} Price`,
                data: prices,
                borderColor: q.dp >= 0 ? "#16a34a" : "#dc2626",
                backgroundColor:
                  q.dp >= 0
                    ? "rgba(22,163,74,0.15)"
                    : "rgba(220,38,38,0.15)",
                fill: true,
                tension: 0.4,
                pointRadius: 2,
                borderWidth: 3,
              },
            ],
          });
        }

        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    load();
  }, [ticker]);

  if (loading) return <h2 style={{ textAlign: "center" }}>Loading...</h2>;
  if (!quote) return <h2>No Data</h2>;

  const green = quote.dp >= 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "20px",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "#1e293b",
            color: "white",
            padding: "16px 20px",
            borderRadius: "12px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0 }}>MarketDash</h2>

          <button
            onClick={() => navigate("/")}
            style={{
              background: "white",
              color: "#111",
              border: "none",
              padding: "8px 14px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            ← Back
          </button>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: "white",
            borderRadius: "14px",
            padding: "20px",
            boxShadow: "0 5px 18px rgba(0,0,0,0.08)",
          }}
        >
          <h1>{names[ticker] || ticker}</h1>

          <h2 style={{ marginBottom: "4px" }}>
            ${quote.c.toFixed(2)}
          </h2>

          <p
            style={{
              color: green ? "green" : "red",
              fontWeight: "bold",
              marginTop: 0,
            }}
          >
            {quote.dp.toFixed(2)}%
          </p>

          {/* Graph */}
          <div
            style={{
              height: "420px",
              marginTop: "20px",
              marginBottom: "20px",
            }}
          >
            {chart && (
              <Line
                data={chart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: true },
                  },
                }}
              />
            )}
          </div>

          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
              gap: "15px",
            }}
          >
            {[
              ["Open", quote.o],
              ["High", quote.h],
              ["Low", quote.l],
              ["Prev Close", quote.pc],
            ].map(([label, val]) => (
              <div
                key={label}
                style={{
                  background: "#f9fafb",
                  padding: "14px",
                  borderRadius: "10px",
                }}
              >
                <p style={{ margin: 0, color: "#666" }}>{label}</p>
                <h3 style={{ margin: "8px 0 0 0" }}>
                  ${val.toFixed(2)}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}