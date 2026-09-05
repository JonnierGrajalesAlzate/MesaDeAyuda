import alerta from "../../../../../shared/services/alertService.js";
import { obtenerDetalleTicket, tomarTicket as reclamarTicket } from "../../../../tickets/services/ticketService.js";

export default async function tomarTicket(ticket, cargarDashboard, setTicketSeleccionado) {
  const confirmation = await alerta.fire({
    icon: "question",
    title: `¿Tomar el ticket #${ticket.id}?`,
    text: "El ticket quedará asignado a tu cuenta y pasará al estado Abierto.",
    showCancelButton: true,
    confirmButtonText: "Tomar ticket",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#0076e3"
  });
  if (!confirmation.isConfirmed) return;

  try {
    const response = await reclamarTicket(ticket.id);
    await cargarDashboard();
    const detail = await obtenerDetalleTicket(ticket.id);
    if (detail.success) setTicketSeleccionado(detail.ticket);
    await alerta.fire({
      icon: "success",
      title: response.message,
      timer: 1500,
      showConfirmButton: false
    });
  } catch (error) {
    await cargarDashboard();
    await alerta.fire({
      icon: "error",
      title: "No se pudo tomar el ticket",
      text: error.response?.data?.message || "Es posible que otro responsable lo haya tomado primero."
    });
  }
}
