import httpClient from "../../../shared/services/httpClient.js";
const API_URL = "/catalogos";
export const obtenerCategorias = async () => {
  const response = await httpClient.get(`${API_URL}/categorias`);
  return response.data;
};
export const obtenerSubcategorias = async categoriaId => {
  const response = await httpClient.get(`${API_URL}/subcategorias`, { params: { categoria_id: categoriaId } });
  return response.data;
};
export const obtenerPrioridades = async () => {
  const response = await httpClient.get(`${API_URL}/prioridades`);
  return response.data;
};
export const obtenerEstados = async () => {
  const response = await httpClient.get(`${API_URL}/estados`);
  return response.data;
};
