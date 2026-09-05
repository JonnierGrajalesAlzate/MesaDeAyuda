import { Router } from "express";
import { obtenerDashboardUsuario } from "../../controllers/Dashboards/dashboardUsuarioController.js";
import { obtenerDashboardTecnico } from "../../controllers/Dashboards/dashboardTecnicoController.js";
import { autorizarRoles } from "../../middleware/auth.js";
const router = Router();
router.get("/usuario/:usuario_id", autorizarRoles("Usuario", "Administrador"), obtenerDashboardUsuario);
router.get("/tecnico/:tecnico_id", autorizarRoles("Tecnico", "Administrador"), obtenerDashboardTecnico);
export default router;
