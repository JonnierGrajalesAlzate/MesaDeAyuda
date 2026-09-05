import httpClient from "../../../shared/services/httpClient.js";
const API_URL = "/noticias";
export const obtenerNoticias = async () => {
  const response = await httpClient.get(API_URL);
  return response.data.noticias;
};
export const obtenerNoticiaPorId = async id => {
  const response = await httpClient.get(`${API_URL}/${id}`);
  return response.data;
};
export const crearNoticia = async noticia => {
  const response = await httpClient.post(API_URL, noticia);
  return response.data;
};
export const actualizarNoticia = async (id, noticia) => {
  const response = await httpClient.put(`${API_URL}/${id}`, noticia);
  return response.data;
};
export const cambiarEstadoNoticia = async (id, estadoId) => {
  const response = await httpClient.patch(`${API_URL}/${id}/estado`, { estado_id: estadoId });
  return response.data;
};
export const eliminarNoticia = async id => {
  const response = await httpClient.delete(`${API_URL}/${id}`);
  return response.data;
};
export const eliminarNoticiaDefinitivamente = async id => {
  const response = await httpClient.delete(`${API_URL}/${id}/definitivo`);
  return response.data;
};
export const obtenerEtiquetas = async () => {
  const response = await httpClient.get(`${API_URL}/etiquetas`);
  return response.data.etiquetas;
};
export const obtenerEstadosNoticia = async () => {
  const response = await httpClient.get(`${API_URL}/estados`);
  return response.data.estados;
};
