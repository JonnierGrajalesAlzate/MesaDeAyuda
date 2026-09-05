import { useCallback, useEffect, useMemo, useState } from "react";
import useRealtimeRefresh from "../../../../../shared/hooks/useRealtimeRefresh.js";
import { obtenerDetalleTicket } from "../../../services/ticketService.js";
export default function useTicketSincronizado(ticketInicial) {
  const [ticketRemoto, setTicketRemoto] = useState(null);
  const ticketId = Number(ticketInicial?.id);
  const recargarTicket = useCallback(async () => {
    if (!Number.isSafeInteger(ticketId) || ticketId < 1) return null;
    const response = await obtenerDetalleTicket(ticketId);
    if (!response.success) return null;
    setTicketRemoto(response.ticket);
    return response.ticket;
  }, [ticketId]);
  useEffect(() => {
    if (!Number.isSafeInteger(ticketId) || ticketId < 1) return undefined;
    let activo = true;
    obtenerDetalleTicket(ticketId).then(response => {
      if (activo && response.success) setTicketRemoto(response.ticket);
    }).catch(error => console.error("No se pudo sincronizar el ticket", error));
    return () => {
      activo = false;
    };
  }, [ticketId]);
  useRealtimeRefresh("tickets", activity => {
    if (!activity?.ticket_id || Number(activity.ticket_id) === ticketId) {
      return recargarTicket();
    }
    return undefined;
  });
  const ticket = useMemo(() => {
    if (Number(ticketRemoto?.id) !== ticketId) return ticketInicial;
    return {
      ...ticketInicial,
      ...ticketRemoto
    };
  }, [ticketId, ticketInicial, ticketRemoto]);
  return {
    ticket,
    recargarTicket
  };
}
