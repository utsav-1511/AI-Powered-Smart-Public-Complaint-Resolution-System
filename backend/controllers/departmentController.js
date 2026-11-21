import Department from "../models/Department.js";
import Complaint from "../models/Complaint.js";
import User from "../models/User.js";

const shape = (d) => ({ ...d.toObject(), id: d._id, lead: d.lead || "Not assigned", email: d.email || "", short: d.short || d.name.split(" ")[0], isActive: d.isActive });
export async function listDepartments(req, res, next) {
  try { const departments = await Department.find({ isActive: true }).sort({ name: 1 }); return res.json({ departments: departments.map(shape) }); }
  catch (error) { return next(error); }
}
export async function createDepartment(req, res, next) {
  try { const department = await Department.create(req.body); return res.status(201).json({ department: shape(department) }); }
  catch (error) { return next(error); }
}
export async function updateDepartment(req, res, next) {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!department) return res.status(404).json({ message: "Department not found" });
    return res.json({ department: shape(department) });
  } catch (error) { return next(error); }
}
export async function removeDepartment(req, res, next) {
  try {
    const [cases, officers] = await Promise.all([Complaint.exists({ department: req.params.id }), User.exists({ department: req.params.id, role: "officer" })]);
    if (cases || officers) return res.status(409).json({ message: "Reassign complaints and officers before removing this department" });
    const department = await Department.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!department) return res.status(404).json({ message: "Department not found" });
    return res.json({ message: "Department removed" });
  } catch (error) { return next(error); }
}
