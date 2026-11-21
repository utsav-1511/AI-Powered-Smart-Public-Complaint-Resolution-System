import { Router } from "express";
import { body } from "express-validator";
import { createDepartment, listDepartments, removeDepartment, updateDepartment } from "../controllers/departmentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";

const router = Router();
router.get("/", listDepartments);
router.post("/", protect, allowRoles("admin"), [body("name").trim().isLength({ min: 2, max: 100 }), body("email").optional({ values: "falsy" }).isEmail(), body("description").optional().isString().isLength({ max: 500 })], validateRequest, createDepartment);
router.put("/:id", protect, allowRoles("admin"), [body("name").optional().trim().isLength({ min: 2, max: 100 }), body("email").optional({ values: "falsy" }).isEmail()], validateRequest, updateDepartment);
router.delete("/:id", protect, allowRoles("admin"), removeDepartment);
export default router;
