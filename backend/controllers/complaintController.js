import { validationResult } from "express-validator";
import Complaint from "../models/Complaint.js";
import Department from "../models/Department.js";
import User from "../models/User.js";

const populated = (query) => query.populate("citizen", "name email").populate("assignedOfficer", "name email availability").populate("department", "name short").populate("statusHistory.updatedBy", "name role");
export function serializeComplaint(item, { publicView = false } = {}) {
  const c = item.toObject ? item.toObject() : item;
  const citizen = c.citizen || {};
  const dept = c.department || {};
  const officer = c.assignedOfficer || {};
  const history = (c.statusHistory || []).map((step) => ({
    status: step.status,
    remarks: step.remarks,
    at: step.timestamp,
    updatedBy: step.updatedBy?.name || "",
  }));
  const result = {
    ...c,
    id: c.complaintId,
    pin: c.pincode,
    departmentId: dept._id || c.department || "",
    departmentName: dept.name || "Unassigned",
    assignedOfficer: officer._id || c.assignedOfficer || "",
    assignedOfficerName: officer.name || "",
    citizen: citizen.name || "",
    citizenEmail: citizen.email || "",
    citizenId: citizen._id || c.citizen,
    notes: c.resolutionNotes || "",
    timeline: history,
  };
  if (publicView) {
    delete result.citizenEmail;
    delete result.citizenId;
    delete result.citizen;
    delete result.image;
  }
  return result;
}
const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() }); return true; }
  return false;
};
const send = (res, docs) => res.json({ complaints: docs.map(serializeComplaint) });
const findByRouteId = (id) => Complaint.findOne(id.startsWith("CMP-") ? { complaintId: id } : { _id: id });

export async function createComplaint(req, res, next) {
  try {
    if (validate(req, res)) return;
    if (req.body.departmentId && !(await Department.exists({ _id: req.body.departmentId, isActive: true }))) return res.status(400).json({ message: "Selected department is unavailable" });
    const escapedTitle = req.body.title.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const duplicate = await Complaint.findOne({
      citizen: req.user._id,
      title: new RegExp(`^${escapedTitle}$`, "i"),
      pincode: req.body.pincode || req.body.pin,
      status: { $nin: ["Resolved", "Rejected"] },
      createdAt: { $gte: new Date(Date.now() - 48 * 60 * 60 * 1000) },
    }).select("complaintId");
    if (duplicate) return res.status(409).json({ message: `A similar open complaint already exists (${duplicate.complaintId})` });
    const year = new Date().getFullYear();
    const prefix = `CMP-${year}-`;
    let complaint;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const latest = await Complaint.findOne({ complaintId: new RegExp(`^CMP-${year}-`) }).sort({ complaintId: -1 }).select("complaintId");
      const seq = Number(latest?.complaintId.split("-").at(-1) || 0) + 1;
      try {
        complaint = await Complaint.create({
          complaintId: `${prefix}${String(seq).padStart(3, "0")}`,
          title: req.body.title,
          description: req.body.description,
          category: req.body.category,
          location: req.body.location,
          city: req.body.city,
          pincode: req.body.pincode || req.body.pin,
          image: req.body.image || "",
          priority: req.body.priority || "Medium",
          department: req.body.departmentId || undefined,
          aiAnalysis: req.body.aiAnalysis,
          citizen: req.user._id,
          statusHistory: [{ status: "Submitted", remarks: "Complaint submitted", updatedBy: req.user._id }],
        });
        break;
      } catch (error) { if (error.code !== 11000 || attempt === 2) throw error; }
    }
    return res.status(201).json({ complaint: serializeComplaint(await populated(Complaint.findById(complaint._id))) });
  } catch (error) { return next(error); }
}

export async function listComplaints(req, res, next) {
  try {
    const filter = req.user.role === "citizen" ? { citizen: req.user._id } : req.user.role === "officer" ? { assignedOfficer: req.user._id } : {};
    const docs = await populated(Complaint.find(filter).sort({ createdAt: -1 }));
    return send(res, docs);
  } catch (error) { return next(error); }
}
export async function myComplaints(req, res, next) {
  try { return send(res, await populated(Complaint.find({ citizen: req.user._id }).sort({ createdAt: -1 }))); }
  catch (error) { return next(error); }
}
export async function getComplaint(req, res, next) {
  try {
    const doc = await populated(Complaint.findOne({ $or: [{ _id: req.params.id }, { complaintId: req.params.id }] }));
    if (!doc) return res.status(404).json({ message: "Complaint not found" });
    if (req.user.role === "citizen" && doc.citizen._id.toString() !== req.user._id.toString()) return res.status(403).json({ message: "You can only view your own complaints" });
    if (req.user.role === "officer" && doc.assignedOfficer?._id.toString() !== req.user._id.toString()) return res.status(403).json({ message: "This complaint is not assigned to you" });
    return res.json({ complaint: serializeComplaint(doc) });
  } catch (error) { return next(error); }
}
export async function trackComplaint(req, res, next) {
  try {
    const doc = await populated(Complaint.findOne({ complaintId: req.params.complaintId }));
    if (!doc) return res.status(404).json({ message: "Complaint not found" });
    return res.json({ complaint: serializeComplaint(doc, { publicView: true }) });
  } catch (error) { return next(error); }
}

export async function updateStatus(req, res, next) {
  try {
    if (validate(req, res)) return;
    const complaint = await findByRouteId(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    if (req.user.role === "officer" && complaint.assignedOfficer?.toString() !== req.user._id.toString()) return res.status(403).json({ message: "This complaint is not assigned to you" });
    const { status, remarks = "", resolutionNotes } = req.body;
    complaint.status = status;
    if (remarks || resolutionNotes !== undefined) complaint.resolutionNotes = resolutionNotes ?? remarks;
    complaint.statusHistory.push({ status, remarks: remarks || resolutionNotes || "Status updated", updatedBy: req.user._id });
    await complaint.save();
    return res.json({ complaint: serializeComplaint(await populated(Complaint.findById(complaint._id))) });
  } catch (error) { return next(error); }
}

export async function assignComplaint(req, res, next) {
  try {
    if (validate(req, res)) return;
    const { departmentId, assignedOfficer, priority } = req.body;
    const complaint = await findByRouteId(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    if (departmentId) {
      const department = await Department.findOne({ _id: departmentId, isActive: true });
      if (!department) return res.status(400).json({ message: "Select an active department" });
      complaint.department = department._id;
    } else if (departmentId === "") complaint.department = null;
    if (assignedOfficer) {
      const officer = await User.findOne({ _id: assignedOfficer, role: "officer" });
      if (!officer) return res.status(400).json({ message: "Select a valid officer" });
      if (complaint.department && officer.department?.toString() !== complaint.department.toString()) return res.status(400).json({ message: "Officer must belong to the selected department" });
      complaint.assignedOfficer = officer._id;
      if (["Submitted", "Under Review"].includes(complaint.status)) complaint.status = "Assigned";
    } else if (assignedOfficer === "") complaint.assignedOfficer = null;
    if (priority) complaint.priority = priority;
    complaint.statusHistory.push({ status: complaint.status, remarks: "Assignment updated", updatedBy: req.user._id });
    await complaint.save();
    return res.json({ complaint: serializeComplaint(await populated(Complaint.findById(complaint._id))) });
  } catch (error) { return next(error); }
}
export async function deleteComplaint(req, res, next) {
  try {
    const complaint = await findByRouteId(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    await complaint.deleteOne();
    return res.json({ message: "Complaint deleted" });
  } catch (error) { return next(error); }
}
