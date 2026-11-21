import mongoose from "mongoose";

export async function connectDB() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");
  mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error.message);
  });
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}
