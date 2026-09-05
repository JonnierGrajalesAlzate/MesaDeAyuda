import socket from "../realtime/socket.js";
import { logout } from "./authService.js";
import { limpiarDatosSesionCliente } from "./sessionCleanup.js";

let logoutInProgress = null;

export function cerrarSesionSegura({ force = false } = {}) {
  if (logoutInProgress) return logoutInProgress;

  logoutInProgress = (async () => {
    try {
      await logout();
    } catch (error) {
      const sessionAlreadyInvalid = error.response?.status === 401;
      if (!force && !sessionAlreadyInvalid) throw error;
    }

    socket.disconnect();
    limpiarDatosSesionCliente();
    window.location.replace("/");
  })().finally(() => {
    logoutInProgress = null;
  });

  return logoutInProgress;
}
