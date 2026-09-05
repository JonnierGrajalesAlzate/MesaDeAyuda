import { useEffect, useRef, useState } from "react";
import alerta from "../../../../shared/services/alertService.js";
import { actualizarEstadoTicket } from "../../services/ticketService.js";

function validColor(color, fallback = "#0076e3") {
  return /^#[0-9a-f]{6}$/i.test(String(color || "")) ? color : fallback;
}

const NEXT_STATUS = {
  1: { id: 3, label: "En proceso" },
  3: { id: 2, label: "Cerrado" },
  5: { id: 2, label: "Cerrado" },
  2: { id: 5, label: "Reabrir" },
};

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 7.5 5 5 5-5" />
    </svg>
  );
}

/**
 * Mantiene la pastilla de estado tal cual estaba y le agrega una flechita
 * para desplegar el único siguiente paso válido del flujo (abierto -> en
 * proceso -> cerrado -> reabrir), en vez de botones sueltos en otro menú.
 */
function TicketStatusSelect({ ticket, canOperate, onIniciar, onCerrarTicket, onTicketActualizado }) {
  const [open, setOpen] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const containerRef = useRef(null);
  const statusId = Number(ticket.estado_id);
  const statusColor = validColor(ticket.color || ticket.estado_color);
  const next = canOperate ? NEXT_STATUS[statusId] : undefined;

  useEffect(() => {
    if (!open) return undefined;
    const closeOutside = event => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);

  const pillStyle = { "--ticket-status": statusColor, "--ticket-status-soft": `${statusColor}18` };

  if (!next) {
    return (
      <span className="ticket-status-pill" style={pillStyle}>
        <i aria-hidden="true" />
        {ticket.estado}
      </span>
    );
  }

  const reopen = async () => {
    const confirmation = await alerta.fire({
      icon: "question",
      title: "Reabrir ticket",
      text: "El ticket cambiará a REABIERTO y se habilitarán nuevamente los mensajes.",
      showCancelButton: true,
      confirmButtonText: "Sí, reabrir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#00a87f"
    });
    if (!confirmation.isConfirmed) return;

    setProcesando(true);
    try {
      const response = await actualizarEstadoTicket(ticket.id, 5);
      await onTicketActualizado?.();
      await alerta.fire({
        icon: "success",
        title: "Ticket reabierto",
        text: response.message,
        timer: 1800,
        showConfirmButton: false
      });
    } catch (error) {
      await alerta.fire({
        icon: "error",
        title: "No se pudo reabrir",
        text: error.response?.data?.message || "Intenta nuevamente.",
        confirmButtonColor: "#0076e3"
      });
    } finally {
      setProcesando(false);
    }
  };

  const applyNext = async () => {
    setOpen(false);

    if (next.id === 2) {
      setProcesando(true);
      try {
        await onCerrarTicket(ticket);
      } finally {
        setProcesando(false);
      }
      return;
    }

    if (next.id === 5) {
      await reopen();
      return;
    }

    setProcesando(true);
    try {
      await onIniciar(ticket);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <span ref={containerRef} className="ticket-status-toggle">
      <span className="ticket-status-pill" style={pillStyle}>
        <i aria-hidden="true" />
        {ticket.estado}

        <button
          type="button"
          className="ticket-status-toggle-btn"
          aria-label="Cambiar estado del ticket"
          aria-haspopup="menu"
          aria-expanded={open}
          disabled={procesando}
          onClick={() => setOpen(current => !current)}
        >
          <ChevronDownIcon />
        </button>
      </span>

      {open && (
        <div role="menu" className="ticket-status-menu">
          <button type="button" role="menuitem" className="ticket-status-menu-option" onClick={applyNext}>
            {next.label}
          </button>
        </div>
      )}
    </span>
  );
}

export default TicketStatusSelect;
