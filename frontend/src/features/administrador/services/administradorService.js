import httpClient from "../../../shared/services/httpClient.js";
export const obtenerTicketsAdministrador = async (filtros = {}) => (await httpClient.get("/administrador/tickets", {
  params: filtros
})).data;
export const obtenerTecnicosElegiblesTicket = async ticketId => (await httpClient.get(`/administrador/tickets/${ticketId}/tecnicos-elegibles`)).data;
export const reasignarTicket = async (ticketId, tecnicoId) => (await httpClient.patch(`/administrador/tickets/${ticketId}/reasignar`, { tecnico_id: tecnicoId })).data;
