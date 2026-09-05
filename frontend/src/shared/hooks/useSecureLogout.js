import { useState } from "react";

import alerta from "../services/alertService.js";
import { cerrarSesionSegura } from "../services/secureLogout.js";

const LOGOUT_ERROR_ALERT = {
  icon: "error",
  title: "No se pudo cerrar la sesión",
  text: "No fue posible confirmar la revocación segura. Verifica la conexión e intenta nuevamente.",
  confirmButtonColor: "#0076e3"
};

/**
 * Centraliza el cierre de sesión para evitar solicitudes simultáneas y
 * presentar una respuesta de error consistente en toda la navegación.
 */
export default function useSecureLogout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await cerrarSesionSegura();
    } catch {
      setIsLoggingOut(false);
      await alerta.fire(LOGOUT_ERROR_ALERT);
    }
  };

  return { isLoggingOut, logout };
}
