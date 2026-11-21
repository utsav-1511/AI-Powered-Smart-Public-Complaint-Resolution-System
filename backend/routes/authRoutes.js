import { Router } from "express";
import { body } from "express-validator";
import { login, me, register, updateMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();
router.post("/register", [body("name").trim().isLength({ min: 2, max: 100 }), body("email").isEmail().normalizeEmail(), body("password").isLength({ min: 8 }), body("phone").optional().trim().isLength({ max: 30 })], register);
router.post("/login", [body("email").isEmail().normalizeEmail(), body("password").isString().notEmpty()], login);
router.get("/me", protect, me);
router.patch("/me", protect, updateMe);
export default router;
