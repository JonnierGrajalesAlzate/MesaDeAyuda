import httpClient from "../../../shared/services/httpClient.js";
const API = "/base-conocimiento/procedimientos";
export const crearProcedimiento = async datos => {
  const response = await httpClient.post(API, datos);
  return response.data;
};
export const obtenerProcedimientos = async (params = {}) => {
  const response = await httpClient.get(API, { params });
  return response.data;
};
export const obtenerProcedimientoPorId = async id => {
  const response = await httpClient.get(`${API}/${id}`);
  return response.data;
};
export const actualizarProcedimiento = async (id, datos) => {
  const response = await httpClient.put(`${API}/${id}`, datos);
  return response.data;
};
export const eliminarProcedimiento = async id => {
  const response = await httpClient.delete(`${API}/${id}`);
  return response.data;
};
export const publicarProcedimiento = async id => {
  const response = await httpClient.put(`${API}/${id}/publicar`);
  return response.data;
};
export const archivarProcedimiento = async id => {
  const response = await httpClient.put(`${API}/${id}/archivar`);
  return response.data;
};
export const restaurarProcedimiento = async id => {
  const response = await httpClient.put(`${API}/${id}/restaurar`);
  return response.data;
};
export const incrementarVista = async id => {
  const response = await httpClient.patch(`${API}/${id}/vista`);
  return response.data;
};
export const obtenerProcedimientosPorCategoria = async categoriaId => {
  const response = await httpClient.get(`${API}/categoria/${categoriaId}`);
  return response.data;
};
export const buscarTicketsReferencia = async (buscar = "") => {
  const response = await httpClient.get(`${API}/tickets-referencia`, { params: { buscar } });
  return response.data;
};
export const crearNotaProcedimiento = async (id, nota) => {
  const response = await httpClient.post(`${API}/${id}/notas`, { nota });
  return response.data;
};
