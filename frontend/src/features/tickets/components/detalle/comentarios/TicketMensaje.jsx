function TicketMensaje({
  mensaje,
  setMensaje,
  enviarComentario,
  enviando,
  ticket
}) {
  const status = String(ticket?.estado || "").trim().toUpperCase();
  const canReply = ["EN PROCESO", "REABIERTO"].includes(status)
    || [3, 5].includes(Number(ticket?.estado_id));

  const submit = event => {
    event.preventDefault();
    if (!canReply || enviando || !mensaje.trim()) return;
    enviarComentario();
  };

  return (
    <form onSubmit={submit} className="ticket-composer">
      {!canReply && (
        <div className="ticket-composer-notice">
          No se pueden enviar mensajes en este momento.
        </div>
      )}

      <label htmlFor={`ticket-message-${ticket.id}`}>Responder al caso</label>
      <div className="ticket-composer-field">
        <textarea
          id={`ticket-message-${ticket.id}`}
          value={mensaje}
          onChange={event => setMensaje(event.target.value)}
          disabled={!canReply}
          maxLength={2000}
          rows={3}
          placeholder={canReply ? "Escribe un mensaje para continuar la conversación…" : "Mensajes bloqueados"}
        />
        <div className="ticket-composer-footer">
          <span>{mensaje.length}/2000</span>
          <button
            type="submit"
            disabled={!canReply || enviando || !mensaje.trim()}
          >
            <span>{enviando ? "Enviando…" : "Enviar mensaje"}</span>
          </button>
        </div>
      </div>
    </form>
  );
}

export default TicketMensaje;
