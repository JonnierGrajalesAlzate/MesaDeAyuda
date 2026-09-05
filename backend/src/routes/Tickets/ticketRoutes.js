import { Router } from "express";
import { crearTicket, obtenerUltimosTickets, TodosTickets, InfoTicket, obtenerDetalleTicket } from "../../controllers/Tickets/ticketController.js";
import { actualizarEstadoTicket } from "../../controllers/Tickets/actualizarEstado.js";
import { autorizarRoles } from "../../middleware/auth.js";
import { crearUploadSeguro, TIPOS_TICKET } from "../../middleware/upload.js";
import { crearSolicitudReapertura, obtenerSolicitudReapertura, resolverSolicitudReapertura } from "../../controllers/Tickets/reaperturaController.js";
import { crearSolicitudReasignacion, obtenerSolicitudReasignacion, resolverSolicitudReasignacion } from "../../controllers/Tickets/reasignacionController.js";
import { tomarTicket } from "../../controllers/Tickets/tomarTicketController.js";
const router = Router();
const uploadTicket = crearUploadSeguro({
  tiposPermitidos: TIPOS_TICKET,
  campo: "adjunto"
});
router.post("/", autorizarRoles("Usuario", "Administrador"), uploadTicket, crearTicket);
router.get("/ultimos-tickets/:usuarioId", autorizarRoles("Usuario", "Administrador"), obtenerUltimosTickets);
router.get("/todos-tickets/:usuarioId", autorizarRoles("Usuario", "Administrador"), TodosTickets);
router.get("/info-ticket/:ticketId", InfoTicket);
router.get("/:id/solicitud-reapertura", obtenerSolicitudReapertura);
router.post("/:id/solicitudes-reapertura", autorizarRoles("Usuario"), crearSolicitudReapertura);
router.patch("/:id/solicitudes-reapertura/:solicitudId", autorizarRoles("Tecnico", "Administrador"), resolverSolicitudReapertura);
router.put("/:id/estado", autorizarRoles("Tecnico", "Administrador"), actualizarEstadoTicket);
router.patch("/:id/tomar", autorizarRoles("Tecnico", "Administrador"), tomarTicket);
router.get("/:id/solicitud-reasignacion", obtenerSolicitudReasignacion);
router.post("/:id/solicitudes-reasignacion", autorizarRoles("Tecnico"), crearSolicitudReasignacion);
router.patch("/:id/solicitudes-reasignacion/:solicitudId", autorizarRoles("Tecnico", "Administrador"), resolverSolicitudReasignacion);
router.get("/:id", obtenerDetalleTicket);
export default router;
