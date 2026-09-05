import httpClient from "../../../../shared/services/httpClient.js";
const API = "/comentarios";
export const obtenerComentarios = async ticket_id => {
  const response = await httpClient.get(`${API}/${ticket_id}`);
  return response.data;
};
export const crearComentario = async datos => {
  const response = await httpClient.post(API, datos);
  return response.data;
};
