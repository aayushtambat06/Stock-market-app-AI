import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import chatRoutes from "./routes/chatRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", chatRoutes);
app.use("/api", stockRoutes);

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});