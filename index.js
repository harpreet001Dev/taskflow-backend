import express from "express";
import cors from "cors";
import "dotenv/config.js";


const PORT=process.env.PORT || 5000;

const app=express();
app.use(cors())
app.use(express.json());

// app.use("/api",router)


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})