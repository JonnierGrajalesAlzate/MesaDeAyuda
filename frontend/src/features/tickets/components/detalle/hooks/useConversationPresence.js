import { useEffect } from "react";
import socket from "../../../../../shared/realtime/socket.js";
const ENTRAR = "CONVERSACION_ENTRAR";
const SALIR = "CONVERSACION_SALIR";
export default function useConversationPresence(ticketId, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;
    const id = Number(ticketId);
    if (!Number.isSafeInteger(id) || id < 1) return undefined;
    const entrar = () => {
      if (document.visibilityState === "visible" && socket.connected) {
        socket.emit(ENTRAR, {
          ticketId: id
        });
      }
    };
    const salir = () => {
      if (socket.connected) socket.emit(SALIR, {
        ticketId: id
      });
    };
    const sincronizarVisibilidad = () => {
      if (document.visibilityState === "visible") entrar();else salir();
    };
    socket.on("connect", entrar);
    document.addEventListener("visibilitychange", sincronizarVisibilidad);
    entrar();
    return () => {
      salir();
      socket.off("connect", entrar);
      document.removeEventListener("visibilitychange", sincronizarVisibilidad);
    };
  }, [ticketId, enabled]);
}
