import { Router } from "express";
import { TodosTicketsTecnico } from "../../controllers/Estadisticas/ticketEstadisticasController.js";
import { autorizarRoles } from "../../middleware/auth.js";
const router = Router();
router.get("/tickets-tecnico/:tecnicoId", autorizarRoles("Tecnico", "Administrador"), TodosTicketsTecnico);
export default router;
