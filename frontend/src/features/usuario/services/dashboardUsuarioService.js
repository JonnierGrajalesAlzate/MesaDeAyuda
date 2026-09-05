import httpClient from "../../../shared/services/httpClient.js";
const API_URL = "/dashboard";
export const obtenerDashboardUsuario = async usuarioId => {
  const response = await httpClient.get(`${API_URL}/usuario/${usuarioId}`);
  return response.data;
};
