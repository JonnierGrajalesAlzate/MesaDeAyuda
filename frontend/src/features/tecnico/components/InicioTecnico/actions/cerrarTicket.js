import alerta from "../../../../../shared/services/alertService.js";
import { actualizarEstadoTicket } from "../../../../tickets/services/ticketService.js";
async function cerrarTicket(ticket, cargarDashboard, setTicketSeleccionado) {
  const result = await alerta.fire({
    title: "Cerrar ticket",
    text: "¿Está seguro de cerrar este ticket?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, cerrar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#16a34a"
  });
  if (!result.isConfirmed) {
    return;
  }
  try {
    const response = await actualizarEstadoTicket(ticket.id, 2);
    await alerta.fire({
      icon: "success",
      title: "Ticket cerrado",
      text: response.message,
      timer: 1800,
      showConfirmButton: false
    });
    setTicketSeleccionado(null);
    await cargarDashboard();
  } catch {
    alerta.fire({
      icon: "error",
      title: "Error",
      text: "No fue posible cerrar el ticket."
    });
  }
}
export default cerrarTicket;
