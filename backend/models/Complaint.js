import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  complaintId: { type: String, unique: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, trim: true, maxlength: 1200 },
  category: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true, maxlength: 300 },
  city: { type: String, required: true, trim: true, maxlength: 100 },
  pincode: { type: String, required: true, match: /^\d{6}$/ },
  image: { type: String, default: "", maxlength: 2800000 },
  priority: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
  status: { type: String, enum: ["Submitted", "Under Review", "Assigned", "In Progress", "Resolved", "Rejected"], default: "Submitted" },
  citizen: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null, index: true },
  aiAnalysis: { category: String, priority: String, department: String, confidence: Number },
  statusHistory: [{
    status: { type: String, enum: ["Submitted", "Under Review", "Assigned", "In Progress", "Resolved", "Rejected"] },
    remarks: { type: String, default: "" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    timestamp: { type: Date, default: Date.now },
  }],
  resolutionNotes: { type: String, default: "", maxlength: 3000 },
}, { timestamps: true });

export default mongoose.model("Complaint", complaintSchema);
