import httpClient from "../../../../shared/services/httpClient.js";
const API = "/administrador/usuarios";
export const listarUsuarios = async () => (await httpClient.get(API)).data;
export const obtenerCatalogosUsuarios = async () => (await httpClient.get(`${API}/catalogos`)).data;
export const obtenerTransferenciaPendiente = async id => (await httpClient.get(`${API}/${id}/transferencia-pendientes`)).data;
export const crearUsuario = async payload => (await httpClient.post(API, payload)).data;
export const actualizarUsuario = async (id, payload) => (await httpClient.put(`${API}/${id}`, payload)).data;
export const eliminarUsuario = async (id, transferir_a_id) => (await httpClient.delete(`${API}/${id}`, {
  data: transferir_a_id ? { transferir_a_id } : undefined
})).data;
