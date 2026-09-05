import httpClient from "../../../shared/services/httpClient.js";
export async function obtenerSolicitudReapertura(ticketId) {
  const response = await httpClient.get(`/tickets/${ticketId}/solicitud-reapertura`);
  return response.data;
}
export async function crearSolicitudReapertura(ticketId, motivo) {
  const response = await httpClient.post(`/tickets/${ticketId}/solicitudes-reapertura`, {
    motivo
  });
  return response.data;
}
export async function resolverSolicitudReapertura(ticketId, solicitudId, decision) {
  const response = await httpClient.patch(`/tickets/${ticketId}/solicitudes-reapertura/${solicitudId}`, {
    decision
  });
  return response.data;
}
