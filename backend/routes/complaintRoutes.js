import { Router } from "express";
import { body } from "express-validator";
import { assignComplaint, createComplaint, deleteComplaint, getComplaint, listComplaints, myComplaints, trackComplaint, updateStatus } from "../controllers/complaintController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = Router();
router.get("/track/:complaintId", trackComplaint);
router.use(protect);
router.post("/", allowRoles("citizen"), [body("title").trim().isLength({ min: 5, max: 100 }), body("description").trim().isLength({ min: 15, max: 1200 }), body("category").trim().notEmpty(), body("location").trim().notEmpty(), body("city").trim().notEmpty(), body("pin").optional().matches(/^\d{6}$/), body("pincode").optional().matches(/^\d{6}$/), body("priority").optional().isIn(["Low", "Medium", "High", "Critical"])], createComplaint);
router.get("/my", allowRoles("citizen"), myComplaints);
router.get("/", allowRoles("officer", "admin"), listComplaints);
router.get("/:id", getComplaint);
router.patch("/:id/status", allowRoles("officer", "admin"), [body("status").isIn(["Submitted", "Under Review", "Assigned", "In Progress", "Resolved", "Rejected"]), body("remarks").optional().isString().isLength({ max: 3000 })], updateStatus);
router.patch("/:id/assign", allowRoles("admin"), [body("priority").optional().isIn(["Low", "Medium", "High", "Critical"])], assignComplaint);
router.delete("/:id", allowRoles("admin"), deleteComplaint);
export default router;
