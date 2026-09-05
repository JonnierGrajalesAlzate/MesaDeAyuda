function TicketDescripcion({ ticket }) {
  return (
    <section className="ticket-detail-section">
      <h4>Descripción</h4>
      <p className="ticket-description">
        {ticket?.descripcion || "Este ticket no tiene una descripción."}
      </p>
    </section>
  );
}

export default TicketDescripcion;
