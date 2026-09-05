import { Router } from "express";
import { autorizarRoles } from "../../../middleware/auth.js";
import { obtenerReportes } from "../../../controllers/Administrador/Reportes/reportesController.js";
const router = Router();
router.get("/", autorizarRoles("Administrador"), obtenerReportes);
export default router;
