import httpClient from "../../../../shared/services/httpClient.js";
const API = "/administrador/categorias";
export const listarSubcategorias = async categoriaId => (await httpClient.get(`${API}/${categoriaId}/subcategorias`)).data;
export const crearSubcategoria = async (categoriaId, descripcion, prioridad_id) => (await httpClient.post(`${API}/${categoriaId}/subcategorias`, {
  descripcion,
  prioridad_id
})).data;
export const actualizarSubcategoria = async (id, descripcion, prioridad_id) => (await httpClient.put(`${API}/subcategorias/${id}`, {
  descripcion,
  prioridad_id
})).data;
export const eliminarSubcategoria = async id => (await httpClient.delete(`${API}/subcategorias/${id}`)).data;
