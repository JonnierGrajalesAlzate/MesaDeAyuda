import httpClient from "../../../../shared/services/httpClient.js";
const API = "/administrador/areas";
export const crearArea = async nombre => (await httpClient.post(API, {
  nombre
})).data;
export const actualizarArea = async (id, nombre) => (await httpClient.put(`${API}/${id}`, {
  nombre
})).data;
export const eliminarArea = async id => (await httpClient.delete(`${API}/${id}`)).data;
