import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  phone: { type: String, trim: true, default: "" },
  role: { type: String, enum: ["citizen", "officer", "admin"], default: "citizen" },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
  availability: { type: String, enum: ["Available", "On field", "Unavailable"], default: "Available" },
}, { timestamps: { createdAt: true, updatedAt: true } });

userSchema.pre("save", async function hashPassword() {
  if (this.isModified("password")) this.password = await bcrypt.hash(this.password, 12);
});
userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
