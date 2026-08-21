import express from "express";
import cors from "cors";
import "dotenv/config.js";
import prisma from "./src/config/database.js";

const PORT=process.env.PORT || 5000;

const app=express();
app.use(cors())
app.use(express.json());

// app.use("/api",router)

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


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})