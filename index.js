import "dotenv/config.js";
import app from "./app.js";
import { connectDatabase } from "./src/config/dbconnect.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await connectDatabase();

        app.listen(PORT, () => {
            console.log(`TaskFlow API running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
}

startServer();