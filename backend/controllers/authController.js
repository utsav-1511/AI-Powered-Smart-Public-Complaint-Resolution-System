import { validationResult } from "express-validator";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  department: user.department?._id || user.department || null,
  departmentName: user.department?.name || "",
  availability: user.availability,
});
const validationError = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    return true;
  }
  return false;
};

export async function register(req, res, next) {
  try {
    if (validationError(req, res)) return;
    const { name, email, password, phone } = req.body;
    if (await User.exists({ email: email.toLowerCase() })) return res.status(409).json({ message: "An account with this email already exists" });
    const user = await User.create({ name, email, password, phone, role: "citizen" });
    return res.status(201).json({ user: publicUser(user), token: generateToken(user) });
  } catch (error) { return next(error); }
}

export async function login(req, res, next) {
  try {
    if (validationError(req, res)) return;
    const user = await User.findOne({ email: req.body.email.toLowerCase() }).select("+password").populate("department", "name");
    if (!user || !(await user.comparePassword(req.body.password))) return res.status(401).json({ message: "Email or password is incorrect" });
    return res.json({ user: publicUser(user), token: generateToken(user) });
  } catch (error) { return next(error); }
}

export async function me(req, res) { res.json({ user: publicUser(req.user) }); }

export async function updateMe(req, res, next) {
  try {
    const name = req.body.name?.trim();
    if (!name || name.length < 2 || name.length > 100) return res.status(400).json({ message: "Name must be between 2 and 100 characters" });
    req.user.name = name;
    await req.user.save();
    return res.json({ user: publicUser(req.user) });
  } catch (error) { return next(error); }
}
