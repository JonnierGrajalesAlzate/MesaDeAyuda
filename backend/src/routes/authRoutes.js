import { Router } from "express";
import { login, logout, sesionActual } from "../controllers/authController.js";
import { autenticar } from "../middleware/auth.js";
import { limitarLogin } from "../middleware/security.js";
const router = Router();
router.post("/login", limitarLogin, login);
router.get("/me", autenticar, sesionActual);
router.post("/logout", autenticar, logout);
export default router;
