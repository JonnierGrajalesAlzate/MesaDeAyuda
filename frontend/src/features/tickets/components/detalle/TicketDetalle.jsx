import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TicketArchivo from "./TicketArchivo.jsx";
import TicketActionsMenu from "./TicketActionsMenu.jsx";
import TicketDescripcion from "./TicketDescripcion.jsx";
import TicketHeader from "./TicketHeader.jsx";
import TicketInfo from "./TicketInfo.jsx";
import TicketReapertura from "./TicketReapertura.jsx";
import TicketStatusSelect from "./TicketStatusSelect.jsx";
import TicketConversacion from "./comentarios/TicketConversacion.jsx";
import TicketMensaje from "./comentarios/TicketMensaje.jsx";
import useConversationPresence from "./hooks/useConversationPresence.js";
import useTicketDetalle from "./hooks/useTicketDetalle.js";
import useTicketSincronizado from "./hooks/useTicketSincronizado.js";
import { obtenerSolicitudReasignacion } from "../../services/ticketService.js";

function TicketDetalle({
  ticket: ticketInicial,
  rol,
  administradorOperativo = false,
  administradorId,
  onVolver,
  onIniciar,
  onCerrarTicket,
  onTicketActualizado
}) {
  const navigate = useNavigate();
  const usuarioActual = JSON.parse(localStorage.getItem("usuario") || "null") || {};
  const esAdministrador = String(rol || "").trim().toLowerCase() === "administrador";
  const esTecnico = String(rol || "").trim().toLowerCase() === "tecnico";
  const puedeDocumentar = esAdministrador || esTecnico;
  const [mostrarDetalles, setMostrarDetalles] = useState(true);
  const { ticket, recargarTicket } = useTicketSincronizado(ticketInicial);
  const esPropietarioTecnico = esTecnico && Number(ticket?.tecnico_id) === Number(usuarioActual.id);
  const puedeReasignar = esAdministrador || esPropietarioTecnico;
  const puedeOperarComoAdministrador = administradorOperativo
    && Number(ticket?.tecnico_id) === Number(administradorId);
  const modoAuditoria = esAdministrador && !puedeOperarComoAdministrador;
  const rolOperativo = puedeOperarComoAdministrador ? "tecnico" : rol;
  const puedeOperarTicket = String(rolOperativo || "").trim().toLowerCase() === "tecnico";
  useConversationPresence(ticket?.id, !modoAuditoria);
  const {
    comentarios,
    mensaje,
    setMensaje,
    enviarComentario,
    enviando
  } = useTicketDetalle(ticket?.id);

  useEffect(() => {
    if (!ticket?.id || (!esTecnico && !esAdministrador)) return undefined;
    let active = true;
    obtenerSolicitudReasignacion(ticket.id).then(response => {
      if (!active) return;
      const solicitud = response.solicitud;
      const tienePendiente = solicitud?.estado === "PENDIENTE"
        && Number(solicitud.tecnico_destino_id) === Number(usuarioActual.id);
      if (tienePendiente) {
        const basePath = esAdministrador ? "/administrador" : "/tecnico";
        navigate(`${basePath}/tickets/${ticket.id}/solicitud-reasignacion`, { replace: true });
      }
    }).catch(() => {});
    return () => {
      active = false;
    };
  }, [ticket?.id, esTecnico, esAdministrador, usuarioActual.id, navigate]);

  if (!ticket) return null;

  const sincronizarTicket = async () => {
    await recargarTicket();
    await onTicketActualizado?.();
  };

  const documentarTicket = () => {
    const basePathBaseConocimiento = esAdministrador ? "/administrador/base-conocimiento" : "/baseConocimiento";
    navigate(`${basePathBaseConocimiento}/crear-guia`, { state: { ticketReferencia: ticket } });
  };

  const reasignarTicket = () => {
    const basePath = esAdministrador ? "/administrador" : "/tecnico";
    navigate(`${basePath}/tickets/${ticket.id}/reasignar`);
  };

  return (
    <article className="ticket-detail-shell">
      <TicketHeader
        ticket={ticket}
        onVolver={onVolver}
        rightContent={
          <TicketStatusSelect
            ticket={ticket}
            canOperate={puedeOperarTicket && !modoAuditoria}
            onIniciar={onIniciar}
            onCerrarTicket={onCerrarTicket}
            onTicketActualizado={sincronizarTicket}
          />
        }
      />

      <div className={`ticket-detail-layout ${!mostrarDetalles ? "is-details-hidden" : ""}`}>
        <section className="ticket-conversation-panel" aria-label={`Conversación del ticket ${ticket.id}`}>
          {!modoAuditoria && <TicketReapertura
            key={ticket.id}
            ticket={ticket}
            rol={rolOperativo}
            onTicketActualizado={sincronizarTicket}
            mostrarAccionTecnico={false}
          />}

          <div className="ticket-conversation-summary">
            <span className="ticket-conversation-summary-title">
              <MessageSquare className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              Conversación
            </span>
            <div className="ticket-conversation-toolbar-actions">
              <TicketActionsMenu
                ticket={ticket}
                canToggleDetails
                detailsVisible={mostrarDetalles}
                onToggleDetails={() => setMostrarDetalles(current => !current)}
                canReassign={puedeReasignar}
                onReassign={reasignarTicket}
                canDocument={puedeDocumentar}
                onDocument={documentarTicket}
              />
            </div>
          </div>

          <TicketConversacion comentarios={comentarios} modoAuditoria={modoAuditoria} />

          {!modoAuditoria && <TicketMensaje
            mensaje={mensaje}
            setMensaje={setMensaje}
            enviarComentario={enviarComentario}
            enviando={enviando}
            ticket={ticket}
          />}

          {modoAuditoria && <div className="ticket-readonly-notice" role="note">
            Solo visualización
          </div>}
        </section>

        {mostrarDetalles && <aside className="ticket-details-panel" aria-label="Detalles del ticket">
          <div className="ticket-details-heading">
            <div>
              <h3>Detalles</h3>
            </div>
            <div className="ticket-details-heading-actions">
              <span>#{ticket.id}</span>
            </div>
          </div>

          <TicketInfo ticket={ticket} />
          <TicketDescripcion ticket={ticket} />
          <TicketArchivo ticket={ticket} />
        </aside>}
      </div>
    </article>
  );
}

export default TicketDetalle;
