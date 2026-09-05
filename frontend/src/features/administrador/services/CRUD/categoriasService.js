import httpClient from "../../../../shared/services/httpClient.js";
const API = "/administrador/categorias";
export const crearCategoria = async (nombre, descripcion, prioridad_id) => (await httpClient.post(API, {
  nombre,
  descripcion,
  prioridad_id
})).data;
export const actualizarCategoria = async (id, nombre, descripcion, prioridad_id) => (await httpClient.put(`${API}/${id}`, {
  nombre,
  descripcion,
  prioridad_id
})).data;
export const eliminarCategoria = async id => (await httpClient.delete(`${API}/${id}`)).data;
