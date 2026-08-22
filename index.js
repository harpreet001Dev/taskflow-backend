import express from "express";
import cors from "cors";
import "dotenv/config.js";
import prisma from "./src/config/database.js";
import router from "./src/routes/index.js";
import errorHandler from "./src/middlewares/error.middleware.js";

const PORT=process.env.PORT || 5000;

const app=express();
app.use(cors())
app.use(express.json());

app.use("/api",router)
app.use(errorHandler)

async function startServer() {
  try {
    await prisma.$connect();

    console.log("Connected to PostgreSQL");

    app.listen(PORT, () => {
      console.log(`TaskFlow API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}
startServer();
