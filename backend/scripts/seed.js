import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Department from "../models/Department.js";
import Complaint from "../models/Complaint.js";

const departmentData = [
  ["Public Works Department", "Road repair, footpaths, and public infrastructure", "PWD", "Arvind Kumar", "pwd@civicresolve.in", "#2563eb"],
  ["Sanitation Department", "Waste collection and public cleanliness", "Sanitation", "Meera Singh", "sanitation@civicresolve.in", "#16a34a"],
  ["Water Supply Department", "Water supply, pipelines, and public taps", "Water", "Rajesh Verma", "water@civicresolve.in", "#0891b2"],
  ["Electricity Department", "Street lighting and municipal electrical issues", "Electricity", "Sanjay Rao", "electricity@civicresolve.in", "#d97706"],
  ["Drainage Department", "Stormwater drains, flooding, and sewage", "Drainage", "Priya Das", "drainage@civicresolve.in", "#7c3aed"],
];
const userData = [
  { name: "Admin User", email: "admin@civicresolve.in", role: "admin" },
  { name: "Ananya Sharma", email: "ananya@example.com", role: "citizen", phone: "9876500001" },
  { name: "Rohan Gupta", email: "rohan@example.com", role: "citizen", phone: "9876500002" },
  { name: "Arvind Kumar", email: "arvind.k@civicresolve.in", role: "officer", departmentName: "Public Works Department" },
  { name: "Meera Singh", email: "meera.s@civicresolve.in", role: "officer", departmentName: "Sanitation Department" },
  { name: "Rajesh Verma", email: "rajesh.v@civicresolve.in", role: "officer", departmentName: "Water Supply Department" },
];
const cases = [
  ["Deep potholes near residential crossing", "Several large potholes have formed outside Sector 18 market. Two-wheelers are swerving into traffic to avoid them.", "Roads & Infrastructure", "Sector 18 market crossing", "Noida", "201301", 1, 0, 0, "High", "In Progress", "Repair crew scheduled for tomorrow morning."],
  ["Garbage not collected for three days", "Community bins are overflowing near the park entrance and attracting stray animals.", "Waste Management", "Alpha 2 park entrance", "Greater Noida", "201310", 2, 1, 1, "Medium", "Assigned", "Collection crew notified."],
  ["Streetlight out on main road", "The streetlight outside the community centre has been off for a week, making the road unsafe at night.", "Street Lighting", "Civil Lines community centre", "Prayagraj", "211001", 1, 3, null, "High", "Under Review", ""],
  ["Water leakage at Sector 62 junction", "A water pipe has been leaking continuously and water is collecting at the junction.", "Water Supply", "Sector 62 junction", "Noida", "201309", 2, 2, 2, "Critical", "Resolved", "Pipe joint replaced and water supply restored."],
  ["Blocked drainage after rainfall", "The drain beside the school is blocked and water has not receded since yesterday evening.", "Drainage & Sewage", "Naini public school", "Prayagraj", "211008", 1, 4, null, "Critical", "Submitted", ""],
  ["Irregular morning water supply", "Water pressure has been very low in the neighbourhood for the past four days.", "Water Supply", "Sector 15 residential block", "Greater Noida", "201310", 2, 2, 2, "Medium", "Resolved", "Valve adjusted and supply pressure restored."],
  ["Broken footpath near bus stop", "Loose paving stones create a tripping hazard beside the Sector 37 bus stop.", "Roads & Infrastructure", "Sector 37 bus stop", "Noida", "201303", 1, 0, 0, "Medium", "Under Review", "Inspection requested."],
  ["Overflowing community waste bin", "Waste has spilled onto the footpath and has not been removed since the weekend.", "Waste Management", "Mumfordganj market", "Prayagraj", "211002", 2, 1, 1, "High", "In Progress", "Area cleaned; additional pickup arranged."],
  ["Open drain cover beside clinic", "A drain cover is missing outside the clinic and is difficult to see after sunset.", "Drainage & Sewage", "George Town clinic", "Prayagraj", "211002", 1, 4, null, "Critical", "Assigned", "Safety team dispatched."],
  ["Damaged streetlight pole", "A damaged light fitting is hanging over the road near the crossing.", "Electricity", "Sector 50 crossing", "Noida", "201307", 2, 3, null, "High", "Resolved", "Fitting replaced and pole secured."],
];

try {
  await connectDB();
  const departments = {};
  for (const [name, description, short, lead, email, color] of departmentData) {
    departments[name] = await Department.findOneAndUpdate({ name }, { name, description, short, lead, email, color, isActive: true }, { new: true, upsert: true, setDefaultsOnInsert: true });
  }
  const users = {};
  for (const item of userData) {
    const department = item.departmentName ? departments[item.departmentName]._id : null;
    let user = await User.findOne({ email: item.email }).select("+password");
    if (!user) user = new User({ ...item, department, password: "CivicDemo123!" });
    else Object.assign(user, { ...item, department, password: "CivicDemo123!" });
    await user.save();
    users[item.email] = user;
  }
  const now = Date.now();
  for (const [index, row] of cases.entries()) {
    const [title, description, category, location, city, pincode, citizenIndex, departmentIndex, officerIndex, priority, status, resolutionNotes] = row;
    const departmentName = departmentData[departmentIndex][0];
    const dept = departments[departmentName];
    const citizen = users[citizenIndex === 1 ? "ananya@example.com" : "rohan@example.com"];
    const officer = officerIndex === null ? null : users[userData[3 + officerIndex].email];
    const createdAt = new Date(now - (index + 1) * 86400000);
    const history = [{ status: "Submitted", timestamp: createdAt, updatedBy: citizen._id, remarks: "Complaint submitted" }];
    if (status !== "Submitted") history.push({ status: "Under Review", timestamp: new Date(createdAt.getTime() + 3600000), updatedBy: users["admin@civicresolve.in"]._id, remarks: "Complaint reviewed" });
    if (["Assigned", "In Progress", "Resolved"].includes(status)) history.push({ status: "Assigned", timestamp: new Date(createdAt.getTime() + 7200000), updatedBy: users["admin@civicresolve.in"]._id, remarks: "Assigned to department officer" });
    if (["In Progress", "Resolved"].includes(status)) history.push({ status: "In Progress", timestamp: new Date(createdAt.getTime() + 10800000), updatedBy: officer?._id, remarks: "Work started" });
    if (status === "Resolved") history.push({ status, timestamp: new Date(createdAt.getTime() + 14400000), updatedBy: officer?._id, remarks: resolutionNotes });
    await Complaint.findOneAndUpdate({ complaintId: `CMP-${new Date().getFullYear()}-${String(index + 1).padStart(3, "0")}` }, {
      complaintId: `CMP-${new Date().getFullYear()}-${String(index + 1).padStart(3, "0")}`,
      title, description, category, location, city, pincode, priority, status,
      citizen: citizen._id, department: dept._id, assignedOfficer: officer?._id || null,
      resolutionNotes, image: "", statusHistory: history, createdAt, updatedAt: createdAt,
    }, { upsert: true, new: true, setDefaultsOnInsert: true });
  }
  console.log("Seed data is ready. Demo password for all accounts: CivicDemo123!");
} catch (error) {
  console.error("Seed failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
