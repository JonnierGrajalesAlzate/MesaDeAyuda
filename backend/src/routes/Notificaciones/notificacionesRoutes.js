import { Router } from "express";
import {
  actualizarPreferenciasNotificaciones,
  eliminarNotificacion,
  listarNotificaciones,
  marcarLeida,
  marcarNoLeida,
  marcarTodasLeidas
} from "../../controllers/Notificaciones/notificacionesController.js";
const router = Router();
router.get("/", listarNotificaciones);
router.patch("/preferencias", actualizarPreferenciasNotificaciones);
router.patch("/leer-todas", marcarTodasLeidas);
router.patch("/:id/leer", marcarLeida);
router.patch("/:id/no-leer", marcarNoLeida);
router.delete("/:id", eliminarNotificacion);
export default router;
