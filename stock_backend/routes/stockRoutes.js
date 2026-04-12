import express from "express";
import YahooFinance from "yahoo-finance2";

const router = express.Router();

const yahooFinance = new YahooFinance();

router.get("/stock/:ticker", async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();

  try {
    const data = await yahooFinance.quote(ticker);

    res.json({
      symbol: data.symbol,
      c: data.regularMarketPrice,
      h: data.regularMarketDayHigh,
      l: data.regularMarketDayLow,
      o: data.regularMarketOpen,
      pc: data.regularMarketPreviousClose,
      dp: ((data.regularMarketPrice - data.regularMarketPreviousClose) /
        data.regularMarketPreviousClose) * 100,
    });
  } catch (error) {
    console.error("Yahoo API Error:", error.message);
    res.status(500).json({ error: "Stock fetch failed" });
  }
});

export default router;