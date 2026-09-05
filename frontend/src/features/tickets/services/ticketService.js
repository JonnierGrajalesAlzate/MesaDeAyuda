import httpClient from "../../../shared/services/httpClient.js";
const API_URL = "/tickets";
export const crearTicket = async formData => {
  const response = await httpClient.post(API_URL, formData);
  return response.data;
};
export const obtenerUltimosTickets = async usuarioId => {
  const response = await httpClient.get(`${API_URL}/ultimos-tickets/${usuarioId}`);
  return response.data;
};
export const TodosTickets = async usuarioId => {
  const response = await httpClient.get(`${API_URL}/todos-tickets/${usuarioId}`);
  return response.data;
};
export const InfoTicket = async usuarioId => {
  const response = await httpClient.get(`${API_URL}/info-ticket/${usuarioId}`);
  return response.data;
};
export const actualizarEstadoTicket = async (id, estado_id) => {
  try {
    const response = await httpClient.put(`${API_URL}/${id}/estado`, {
      estado_id
    });
    return response.data;
  } catch (error) {
    console.error("Error actualizando ticket:", error.response?.data || error.message);
    throw error;
  }
};
export const tomarTicket = async id => {
  const response = await httpClient.patch(`${API_URL}/${id}/tomar`);
  return response.data;
};
export const obtenerSolicitudReasignacion = async id => (await httpClient.get(`${API_URL}/${id}/solicitud-reasignacion`)).data;
export const crearSolicitudReasignacion = async (id, tecnicoDestinoId) => (await httpClient.post(`${API_URL}/${id}/solicitudes-reasignacion`, {
  tecnico_destino_id: tecnicoDestinoId
})).data;
export const resolverSolicitudReasignacion = async (id, solicitudId, decision) => (await httpClient.patch(`${API_URL}/${id}/solicitudes-reasignacion/${solicitudId}`, {
  decision
})).data;
export const obtenerDetalleTicket = async id => {
  try {
    const response = await httpClient.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo detalle:", error.response?.data || error.message);
    throw error;
  }
};
