import { obtenerDashboardTecnico } from "../../../services/dashboardTecnicoService.js";
async function cargarDashboard(usuarioId, setEstadisticas, setTickets) {
  try {
    const response = await obtenerDashboardTecnico(usuarioId);
    if (response.success) {
      setEstadisticas(response.estadisticas);
      setTickets(response.tickets);
    }
  } catch (error) {
    console.error("Error cargando dashboard:", error);
  }
}
export default cargarDashboard;
