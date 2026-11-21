import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, default: "" },
  short: { type: String, trim: true, default: "" },
  lead: { type: String, trim: true, default: "Not assigned" },
  email: { type: String, trim: true, lowercase: true, default: "" },
  color: { type: String, default: "#2563eb" },
  isActive: { type: Boolean, default: true },
}, { timestamps: { createdAt: true, updatedAt: true } });

export default mongoose.model("Department", departmentSchema);
