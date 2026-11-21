import { Router } from "express";
import { categories, dashboard, departments } from "../controllers/analyticsController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = Router();
router.use(protect, allowRoles("admin"));
router.get("/dashboard", dashboard);
router.get("/categories", categories);
router.get("/departments", departments);
export default router;
