import { useEffect, useMemo, useRef } from "react";
import iconoMensaje from "../../../../../assets/mensaje.png";
import ComentarioItem from "./ComentarioItem.jsx";

function dayKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toDateString();
}

function dayLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "long" }).format(date);
}

function buildTimelineItems(comentarios) {
  const items = [];
  let lastDay = "";
  for (const comentario of comentarios) {
    const key = dayKey(comentario.fecha);
    if (key && key !== lastDay) {
      items.push({ type: "divider", id: `divider-${key}`, label: dayLabel(comentario.fecha) });
      lastDay = key;
    }
    items.push({ type: "comentario", id: comentario.id, comentario });
  }
  return items;
}

function TicketConversacion({ comentarios, modoAuditoria = false }) {
  const conversationRef = useRef(null);
  const items = useMemo(() => buildTimelineItems(comentarios), [comentarios]);

  useEffect(() => {
    const conversation = conversationRef.current;
    if (!conversation) return;
    conversation.scrollTo({
      top: conversation.scrollHeight,
      behavior: comentarios.length > 1 ? "smooth" : "auto"
    });
  }, [comentarios.length]);

  return (
    <div
      ref={conversationRef}
      role="log"
      aria-live="polite"
      aria-label="Mensajes de la conversación"
      className="ticket-message-list"
    >
      {comentarios.length > 0 ? (
        items.map(item => item.type === "divider" ? (
          <div key={item.id} className="ticket-comment-day-divider">
            <span>{item.label}</span>
          </div>
        ) : (
          <ComentarioItem key={item.id} comentario={item.comentario} modoAuditoria={modoAuditoria} />
        ))
      ) : (
        <div className="ticket-conversation-empty">
          <img src={iconoMensaje} alt="" aria-hidden="true" />
          <strong>La conversación aún no ha comenzado</strong>
          <p>Los mensajes del usuario y del técnico aparecerán en este espacio.</p>
        </div>
      )}
    </div>
  );
}

export default TicketConversacion;
