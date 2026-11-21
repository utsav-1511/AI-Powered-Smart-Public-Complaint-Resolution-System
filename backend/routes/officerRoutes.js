import { Router } from "express";
import { body } from "express-validator";
import { createOfficer, listOfficers, updateOfficer } from "../controllers/officerController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";

const router = Router();
router.use(protect, allowRoles("admin"));
router.get("/", listOfficers);
router.post("/", [body("name").trim().isLength({ min: 2, max: 100 }), body("email").isEmail().normalizeEmail(), body("departmentId").notEmpty(), body("password").optional().isLength({ min: 8 }), body("status").optional().isIn(["Available", "On field", "Unavailable"])], validateRequest, createOfficer);
router.put("/:id", [body("name").optional().trim().isLength({ min: 2, max: 100 }), body("email").optional().isEmail().normalizeEmail(), body("status").optional().isIn(["Available", "On field", "Unavailable"])], validateRequest, updateOfficer);
export default router;
