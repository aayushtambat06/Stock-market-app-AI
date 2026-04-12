import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import YahooFinance from "yahoo-finance2";
import stringSimilarity from "string-similarity";

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey", "ripHistorical"],
});

let lastSymbol = null;
const SYMBOL_MAP = {
  // 🇮🇳 INDIAN STOCKS (MUST HAVE .NS)
  RELIANCE: "RELIANCE.NS",
  TCS: "TCS.NS",
  INFOSYS: "INFY.NS",
  HDFC: "HDFCBANK.NS",
  SBI: "SBIN.NS",
  ITC: "ITC.NS",
  LT: "LT.NS",
  ICICI: "ICICIBANK.NS",
  AXIS: "AXISBANK.NS",
  KOTAK: "KOTAKBANK.NS",
  WIPRO: "WIPRO.NS",
  HCL: "HCLTECH.NS",
  TECHM: "TECHM.NS",
  MARUTI: "MARUTI.NS",
  TATAMOTORS: "TATAMOTORS.NS",
  ADANI: "ADANIENT.NS",
  NTPC: "NTPC.NS",
  ONGC: "ONGC.NS",
  SUNPHARMA: "SUNPHARMA.NS",
  TATASTEEL: "TATASTEEL.NS",
  ZOMATO: "ZOMATO.NS",
  PAYTM: "PAYTM.NS",

  // US STOCKS (NO .NS)
  APPLE: "AAPL",
  AAPL: "AAPL",

  MICROSOFT: "MSFT",
  MSFT: "MSFT",

  GOOGLE: "GOOGL",
  GOOGL: "GOOGL",

  AMAZON: "AMZN",
  AMZN: "AMZN",

  TESLA: "TSLA",
  TSLA: "TSLA",

  NVIDIA: "NVDA",
  NVDA: "NVDA",

  META: "META",
  FACEBOOK: "META",

  NETFLIX: "NFLX",
  NFLX: "NFLX",

  AMD: "AMD"
};
function isGreeting(message) {
  const text = message.toLowerCase();
  const greetings = ["hi", "hello", "hey", "hii", "good morning", "good evening", "thanks"];
  return greetings.some(g => text.includes(g));
}

function isCreatorQuestion(message) {
  const text = message.toLowerCase();
  return text.includes("who made") || text.includes("who created");
}

function detectSymbol(message) {
  const text = message.toUpperCase();

  for (const key in SYMBOL_MAP) {
    if (text.includes(key)) return SYMBOL_MAP[key];
  }

  const words = text.split(" ");
  for (const word of words) {
    const match = stringSimilarity.findBestMatch(word, Object.keys(SYMBOL_MAP));
    if (match.bestMatch.rating > 0.6) {
      return SYMBOL_MAP[match.bestMatch.target];
    }
  }

  return null;
}

async function getStockQuote(symbol) {
  try {
    const data = await yahooFinance.quote(symbol);
    if (!data || !data.regularMarketPrice) throw new Error();

    return {
      symbol: data.symbol,
      price: data.regularMarketPrice,
      prevClose: data.regularMarketPreviousClose,
      open: data.regularMarketOpen,
      high: data.regularMarketDayHigh,
      low: data.regularMarketDayLow,
    };
  } catch {
    return null;
  }
}

async function generateWithRetry(model, prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const r = await model.generateContent(prompt);
      return r.response.text();
    } catch (err) {
      if (i < retries - 1) await new Promise(r => setTimeout(r, 2000));
      else throw err;
    }
  }
}

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    if (isGreeting(message)) {
      return res.json({ reply: "Hello! 👋 Ask me about stocks 📈" });
    }

    if (isCreatorQuestion(message)) {
      return res.json({ reply: "Created by Bikram 🚀" });
    }

    let symbol = detectSymbol(message);

    if (!symbol && lastSymbol) symbol = lastSymbol;

    if (!symbol) {
      return res.json({ reply: "Please mention a stock 📈" });
    }

    lastSymbol = symbol;

    const marketData = await getStockQuote(symbol);

    if (!marketData) {
      return res.json({ reply: "Unable to fetch stock data" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
Stock Data:
${JSON.stringify(marketData)}

User Question:
${message}
`;

    const reply = await generateWithRetry(model, prompt);

    res.json({ reply, marketData });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;