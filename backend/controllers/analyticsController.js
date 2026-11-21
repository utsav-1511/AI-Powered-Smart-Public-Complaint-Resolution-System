import Complaint from "../models/Complaint.js";
import Department from "../models/Department.js";
import User from "../models/User.js";

export async function dashboard(req, res, next) {
  try {
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const [total, byStatus, resolved, officers] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Complaint.countDocuments({ statusHistory: { $elemMatch: { status: "Resolved", timestamp: { $gte: monthStart } } } }),
      User.countDocuments({ role: "officer" }),
    ]);
    const statusCounts = Object.fromEntries(byStatus.map((item) => [item._id, item.count]));
    const open = total - (statusCounts.Resolved || 0) - (statusCounts.Rejected || 0);
    const docs = await Complaint.find({ status: "Resolved" }, "createdAt statusHistory").lean();
    const durations = docs.map((c) => {
      const resolution = [...(c.statusHistory || [])].reverse().find((step) => step.status === "Resolved");
      return resolution ? (new Date(resolution.timestamp) - c.createdAt) / 86400000 : null;
    }).filter((days) => days !== null && days >= 0);
    const avgResolutionDays = durations.length ? Number((durations.reduce((sum, days) => sum + days, 0) / durations.length).toFixed(1)) : 0;
    return res.json({ total, open, resolvedThisMonth: resolved, avgResolutionDays, activeOfficers: officers, byStatus: statusCounts });
  } catch (error) { return next(error); }
}
export async function categories(req, res, next) {
  try { return res.json({ categories: await Complaint.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1 } }]) }); }
  catch (error) { return next(error); }
}
export async function departments(req, res, next) {
  try {
    const list = await Department.find({ isActive: true }).sort({ name: 1 });
    const stats = await Complaint.aggregate([
      { $group: { _id: "$department", total: { $sum: 1 }, resolved: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] } } } },
    ]);
    const map = new Map(stats.map((item) => [item._id?.toString(), item]));
    return res.json({ departments: list.map((d) => ({ id: d._id, name: d.name, short: d.short || d.name.split(" ")[0], ...(map.get(d._id.toString()) || { total: 0, resolved: 0 }) })) });
  } catch (error) { return next(error); }
}
