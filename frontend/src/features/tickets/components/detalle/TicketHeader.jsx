function validColor(color, fallback = "#0076e3") {
  return /^#[0-9a-f]{6}$/i.test(String(color || "")) ? color : fallback;
}

function TicketHeader({ ticket, onVolver, rightContent }) {
  const statusColor = validColor(ticket.color || ticket.estado_color);

  return (
    <header className="ticket-detail-header">
      <button type="button" onClick={onVolver} className="ticket-back-button">
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="m15 18-6-6 6-6" />
        </svg>
        <span>Regresar</span>
      </button>

      <div className="ticket-detail-title">
        <span>Ticket #{ticket.id}</span>
        <h2>{ticket.titulo}</h2>
      </div>

      {rightContent || <span
        className="ticket-status-pill"
        style={{
          "--ticket-status": statusColor,
          "--ticket-status-soft": `${statusColor}18`
        }}
      >
        <i aria-hidden="true" />
        {ticket.estado}
      </span>}
    </header>
  );
}

export default TicketHeader;
