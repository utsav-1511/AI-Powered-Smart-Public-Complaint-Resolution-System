import { validationResult } from "express-validator";
import { randomBytes } from "node:crypto";
import User from "../models/User.js";
import Department from "../models/Department.js";
import Complaint from "../models/Complaint.js";

const shape = (u, count = 0) => ({ id: u._id, name: u.name, email: u.email, role: u.role, departmentId: u.department?._id || u.department || "", department: u.department?.name || "Unassigned", status: u.availability || "Available", assignedCount: count });
export async function listOfficers(req, res, next) {
  try {
    const officers = await User.find({ role: "officer" }).populate("department", "name").sort({ name: 1 });
    const counts = await Complaint.aggregate([{ $match: { assignedOfficer: { $in: officers.map((u) => u._id) } } }, { $group: { _id: "$assignedOfficer", count: { $sum: 1 } } }]);
    const map = new Map(counts.map((item) => [item._id.toString(), item.count]));
    return res.json({ officers: officers.map((u) => shape(u, map.get(u._id.toString()) || 0)) });
  } catch (error) { return next(error); }
}
export async function createOfficer(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    if (await User.exists({ email: req.body.email.toLowerCase() })) return res.status(409).json({ message: "An account with this email already exists" });
    if (!(await Department.exists({ _id: req.body.departmentId, isActive: true }))) return res.status(400).json({ message: "Select an active department" });
    const password = req.body.password || `ChangeMe-${randomBytes(6).toString("hex")}!`;
    const officer = await User.create({ name: req.body.name, email: req.body.email, password, phone: req.body.phone, role: "officer", department: req.body.departmentId, availability: req.body.status || "Available" });
    const hydrated = await User.findById(officer._id).populate("department", "name");
    return res.status(201).json({ officer: shape(hydrated), temporaryPassword: req.body.password ? undefined : password });
  } catch (error) { return next(error); }
}
export async function updateOfficer(req, res, next) {
  try {
    const { name, email, departmentId, status, password, phone } = req.body;
    const officer = await User.findOne({ _id: req.params.id, role: "officer" }).select("+password");
    if (!officer) return res.status(404).json({ message: "Officer not found" });
    if (email && email.toLowerCase() !== officer.email && await User.exists({ email: email.toLowerCase(), _id: { $ne: officer._id } })) return res.status(409).json({ message: "An account with this email already exists" });
    if (departmentId && !(await Department.exists({ _id: departmentId, isActive: true }))) return res.status(400).json({ message: "Select an active department" });
    if (name !== undefined) officer.name = name;
    if (email !== undefined) officer.email = email;
    if (departmentId !== undefined) officer.department = departmentId || null;
    if (status !== undefined) officer.availability = status;
    if (phone !== undefined) officer.phone = phone;
    if (password) officer.password = password;
    await officer.save();
    return res.json({ officer: shape(await User.findById(officer._id).populate("department", "name")) });
  } catch (error) { return next(error); }
}
