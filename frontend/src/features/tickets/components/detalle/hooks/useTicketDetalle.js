import { useCallback, useEffect, useState } from "react";
import useRealtimeRefresh from "../../../../../shared/hooks/useRealtimeRefresh.js";
import { crearComentario, obtenerComentarios } from "../../../services/comentarios/comentarioService.js";
function useTicketDetalle(ticketId) {
  const usuario = JSON.parse(localStorage.getItem("usuario")) || {};
  const [comentarios, setComentarios] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [cargando, setCargando] = useState(Boolean(ticketId));
  const cargarComentarios = useCallback(async ({
    silencioso = false
  } = {}) => {
    if (!ticketId) return;
    if (!silencioso) setCargando(true);
    try {
      const response = await obtenerComentarios(ticketId);
      if (response.success) setComentarios(response.comentarios);
    } catch (error) {
      console.error("No se pudieron cargar los comentarios", error);
    } finally {
      if (!silencioso) setCargando(false);
    }
  }, [ticketId]);
  const enviarComentario = async () => {
    if (!mensaje.trim()) return;
    setEnviando(true);
    try {
      await crearComentario({
        ticket_id: ticketId,
        usuario_id: usuario.id,
        comentario: mensaje
      });
      setMensaje("");
      await cargarComentarios();
    } catch (error) {
      console.error("No se pudo enviar el comentario", error);
    } finally {
      setEnviando(false);
    }
  };
  useEffect(() => {
    let active = true;
    if (!ticketId) {
      Promise.resolve().then(() => {
        if (!active) return;
        setComentarios([]);
        setCargando(false);
      });
      return () => {
        active = false;
      };
    }
    obtenerComentarios(ticketId).then(response => {
      if (active && response.success) setComentarios(response.comentarios);
    }).catch(error => {
      console.error("No se pudieron cargar los comentarios", error);
    }).finally(() => {
      if (active) setCargando(false);
    });
    return () => {
      active = false;
    };
  }, [ticketId]);
  useRealtimeRefresh("comentarios", activity => {
    if (!activity?.ticket_id || Number(activity.ticket_id) === Number(ticketId)) {
      return cargarComentarios({
        silencioso: true
      });
    }
    return undefined;
  });
  return {
    usuario,
    comentarios,
    mensaje,
    setMensaje,
    enviarComentario,
    cargando,
    enviando,
    recargarComentarios: cargarComentarios
  };
}
export default useTicketDetalle;
