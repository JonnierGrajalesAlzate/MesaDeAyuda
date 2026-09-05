import httpClient from "../../../shared/services/httpClient.js";
export const obtenerNotificaciones = async (limit = 30) => (await httpClient.get("/notificaciones", {
  params: {
    limit
  }
})).data;
export const marcarNotificacionLeida = async id => (await httpClient.patch(`/notificaciones/${id}/leer`)).data;
export const marcarNotificacionNoLeida = async id => (await httpClient.patch(`/notificaciones/${id}/no-leer`)).data;
export const marcarNotificacionesLeidas = async () => (await httpClient.patch("/notificaciones/leer-todas")).data;
export const eliminarNotificacion = async id => (await httpClient.delete(`/notificaciones/${id}`)).data;
export const actualizarPreferenciasNotificaciones = async activas => (await httpClient.patch("/notificaciones/preferencias", {
  activas
})).data;
