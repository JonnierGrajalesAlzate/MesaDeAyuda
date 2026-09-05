import { useEffect, useRef } from "react";
import socket from "../realtime/socket.js";
const EVENTO_ACTIVIDAD = "ACTIVIDAD_ACTUALIZADA";
function recursosNormalizados(resources) {
  const values = Array.isArray(resources) ? resources : [resources];
  return [...new Set(values.filter(Boolean).map(String))].sort().join("|");
}
function hayUsuario() {
  try {
    return Boolean(JSON.parse(localStorage.getItem("usuario") || "null")?.id);
  } catch {
    return false;
  }
}

/**
 * Revalida los datos visibles cuando otra sesión modifica un recurso.
 * Los eventos se agrupan para evitar varias consultas durante operaciones
 * compuestas, como guardar un artículo con pasos y archivos.
 */
export default function useRealtimeRefresh(resources, refresh, delay = 180) {
  const refreshRef = useRef(refresh);
  const timerRef = useRef(null);
  const resourceKey = recursosNormalizados(resources);
  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);
  useEffect(() => {
    if (!resourceKey) return undefined;
    const allowed = new Set(resourceKey.split("|"));
    let connectedBefore = socket.connected;
    const schedule = activity => {
      if (activity?.recurso !== "reconexion" && !allowed.has(activity?.recurso)) return;
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        Promise.resolve(refreshRef.current?.(activity)).catch(error => {
          console.error("No se pudo sincronizar la vista en tiempo real", error);
        });
      }, delay);
    };
    const handleConnect = () => {
      if (connectedBefore) schedule({
        recurso: "reconexion",
        accion: "revalidar"
      });
      connectedBefore = true;
    };
    socket.on(EVENTO_ACTIVIDAD, schedule);
    socket.on("connect", handleConnect);
    if (!socket.connected && hayUsuario()) socket.connect();
    return () => {
      window.clearTimeout(timerRef.current);
      socket.off(EVENTO_ACTIVIDAD, schedule);
      socket.off("connect", handleConnect);
    };
  }, [resourceKey, delay]);
}
