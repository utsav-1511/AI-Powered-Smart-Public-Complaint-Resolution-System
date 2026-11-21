import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import officerRoutes from "./routes/officerRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL?.split(",").map((url) => url.trim()) || "http://localhost:5173" }));
app.use(express.json({ limit: "3mb" }));
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/officers", officerRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT) || 5000;
if (!process.env.JWT_SECRET) {
  console.error("Unable to start API: JWT_SECRET is required");
  process.exit(1);
}
connectDB().then(() => app.listen(port, () => console.log(`CivicResolve API listening on ${port}`))).catch((error) => {
  console.error("Unable to start API:", error.message);
  process.exit(1);
});
