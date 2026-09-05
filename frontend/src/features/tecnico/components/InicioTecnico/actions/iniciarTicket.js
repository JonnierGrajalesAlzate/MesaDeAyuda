import { obtenerDetalleTicket, actualizarEstadoTicket } from "../../../../tickets/services/ticketService.js";
async function iniciarTicket(ticket, cargarDashboard, setTicketSeleccionado) {
  try {
    await actualizarEstadoTicket(ticket.id, 3);
    await cargarDashboard();
    const response = await obtenerDetalleTicket(ticket.id);
    if (response.success) {
      setTicketSeleccionado(response.ticket);
    }
  } catch (error) {
    console.error(error);
  }
}
export default iniciarTicket;
