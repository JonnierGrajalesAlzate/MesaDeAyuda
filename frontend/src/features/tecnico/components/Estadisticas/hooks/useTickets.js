import { useCallback, useEffect, useState } from "react";
import useRealtimeRefresh from "../../../../../shared/hooks/useRealtimeRefresh.js";
import { obtenerTicketsTecnico } from "../../../services/estadisticas/ticketEstadisticasService.js";
export default function useTickets(tecnicoId) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(Boolean(tecnicoId));
  const [error, setError] = useState(null);
  const cargarTickets = useCallback(async () => {
    if (!tecnicoId) {
      setTickets([]);
      setLoading(false);
      return;
    }
    setError(null);
    try {
      setTickets(await obtenerTicketsTecnico(tecnicoId));
    } catch (requestError) {
      console.error("No se pudieron cargar los tickets", requestError);
      setError("No fue posible cargar los tickets.");
    } finally {
      setLoading(false);
    }
  }, [tecnicoId]);
  useEffect(() => {
    let active = true;
    if (!tecnicoId) {
      Promise.resolve().then(() => {
        if (!active) return;
        setTickets([]);
        setLoading(false);
      });
      return () => {
        active = false;
      };
    }
    obtenerTicketsTecnico(tecnicoId).then(data => {
      if (!active) return;
      setTickets(data);
      setError(null);
    }).catch(requestError => {
      if (!active) return;
      console.error("No se pudieron cargar los tickets", requestError);
      setError("No fue posible cargar los tickets.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [tecnicoId]);
  useRealtimeRefresh("tickets", cargarTickets);
  return {
    tickets,
    loading,
    error,
    recargarTickets: cargarTickets
  };
}
