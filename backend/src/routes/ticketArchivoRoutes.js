import { Router } from "express";
import { descargarArchivoTicket } from "../controllers/Archivos/descargarArchivoController.js";
const router = Router();
router.get("/:ticketId/:nombre", descargarArchivoTicket);
export default router;
