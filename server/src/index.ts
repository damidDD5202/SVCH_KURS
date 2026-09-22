import "dotenv/config";
import cors from "cors";
import express from "express";
import { env } from "./lib/env.js";
import { authRouter } from "./routes/auth.js";
import { bookingsRouter } from "./routes/bookings.js";
import { favoritesRouter } from "./routes/favorites.js";
import { healthRouter } from "./routes/health.js";
import { reportsRouter } from "./routes/reports.js";
import { resourcesRouter } from "./routes/resources.js";
import { tariffsRouter } from "./routes/tariffs.js";
import { adminRouter } from "./routes/admin.js";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api", healthRouter);
app.use("/api", authRouter);
app.use("/api", resourcesRouter);
app.use("/api", bookingsRouter);
app.use("/api", favoritesRouter);
app.use("/api", reportsRouter);
app.use("/api", tariffsRouter);
app.use("/api", adminRouter);

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${env.PORT}`);
});

