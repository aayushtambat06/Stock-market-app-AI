import express from "express";
import YahooFinance from "yahoo-finance2";

const router = express.Router();
const yahooFinance = new YahooFinance();

/* Quote */
router.get("/stock/:ticker", async (req, res) => {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const data = await yahooFinance.quote(ticker);

    res.json({
      symbol: data.symbol,
      c: data.regularMarketPrice,
      h: data.regularMarketDayHigh,
      l: data.regularMarketDayLow,
      o: data.regularMarketOpen,
      pc: data.regularMarketPreviousClose,
      dp:
        ((data.regularMarketPrice -
          data.regularMarketPreviousClose) /
          data.regularMarketPreviousClose) *
        100,
    });
  } catch (error) {
    res.status(500).json({ error: "Stock fetch failed" });
  }
});

/* History */
router.get("/history/:ticker", async (req, res) => {
  try {
    const ticker = req.params.ticker.toUpperCase();

    const result = await yahooFinance.historical(ticker, {
      period1: "2024-01-01",
      period2: new Date(),
      interval: "1d",
    });

    const filtered = result.filter((item) => item.close);

    res.json({
      s: "ok",
      t: filtered.map((item) =>
        Math.floor(new Date(item.date).getTime() / 1000)
      ),
      c: filtered.map((item) => item.close),
    });
  } catch (error) {
    console.log(error.message);

    res.status(500).json({
      s: "error",
      error: "History fetch failed",
    });
  }
});

export default router;