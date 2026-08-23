import express from "express";
import cors from "cors";
import helmet from "helmet";
import router from "./src/routes/index.js";
import errorHandler from "./src/middlewares/error.middleware.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./src/config/swagger.js";

const app = express();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/api", router);
app.use(errorHandler);

export default app;