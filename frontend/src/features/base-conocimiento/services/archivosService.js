import httpClient from "../../../shared/services/httpClient.js";
const API = "/base-conocimiento/archivos";
export const obtenerArchivosProcedimiento = async id => {
  const response = await httpClient.get(`${API}/procedimiento/${id}`);
  return response.data;
};
export const subirArchivoProcedimiento = async formData => {
  const response = await httpClient.post(`${API}/procedimiento`, formData);
  return response.data;
};
export const eliminarArchivoProcedimiento = async id => {
  const response = await httpClient.delete(`${API}/procedimiento/${id}`);
  return response.data;
};
export const establecerPrincipal = async id => {
  const response = await httpClient.put(`${API}/procedimiento/${id}/principal`);
  return response.data;
};
