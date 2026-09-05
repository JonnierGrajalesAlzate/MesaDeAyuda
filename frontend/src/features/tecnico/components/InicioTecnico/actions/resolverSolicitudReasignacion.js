import alerta from "../../../../../shared/services/alertService.js";
import { resolverSolicitudReasignacion as resolverSolicitud } from "../../../../tickets/services/ticketService.js";

export default async function resolverSolicitudReasignacion(ticket, decision, cargarDashboard, navigate) {
  const aceptar = decision === "ACEPTAR";
  const confirmation = await alerta.fire({
    icon: "question",
    accentColor: "#0076e3",
    title: aceptar ? `¿Aceptar el ticket #${ticket.id}?` : `¿Rechazar la solicitud del ticket #${ticket.id}?`,
    text: aceptar
      ? "El ticket quedará asignado a tu cuenta."
      : "El ticket seguirá asignado al técnico que lo solicitó.",
    showCancelButton: true,
    confirmButtonText: aceptar ? "Aceptar" : "Rechazar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: aceptar ? "#0076e3" : "#dc2626"
  });
  if (!confirmation.isConfirmed) return;

  try {
    const response = await resolverSolicitud(ticket.id, ticket.solicitud_reasignacion_id, decision);
    await cargarDashboard();
    await alerta.fire({
      icon: "success",
      title: response.message,
      timer: 1500,
      showConfirmButton: false
    });
    if (aceptar) navigate(`/tecnico/tickets/${ticket.id}`);
  } catch (error) {
    await cargarDashboard();
    await alerta.fire({
      icon: "error",
      title: "No se pudo responder la solicitud",
      text: error.response?.data?.message
    });
  }
}
