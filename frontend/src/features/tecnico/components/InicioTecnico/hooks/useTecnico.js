import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import cargarDashboardAction from "../actions/cargarDashboard.js";
import resolverSolicitudReasignacionAction from "../actions/resolverSolicitudReasignacion.js";
import tomarTicketAction from "../actions/tomarTicket.js";
import useRealtimeRefresh from "../../../../../shared/hooks/useRealtimeRefresh.js";
function useTecnico() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario")) || {};
  const [estadisticas, setEstadisticas] = useState({
    abiertos: 0,
    proceso: 0,
    espera: 0,
    cerrados: 0,
    reabiertos: 0,
    reasignados: 0
  });
  const [tickets, setTickets] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const cargarDashboard = useCallback(async () => {
    if (!usuario.id) return;
    await cargarDashboardAction(usuario.id, setEstadisticas, setTickets);
  }, [usuario.id]);
  const verDetalle = ticket => navigate(`/tecnico/tickets/${ticket.id}`);
  const tomarTicket = ticket => tomarTicketAction(ticket, cargarDashboard, ticketTomado => navigate(`/tecnico/tickets/${ticketTomado.id}`));
  const aceptarSolicitud = ticket => resolverSolicitudReasignacionAction(ticket, "ACEPTAR", cargarDashboard, navigate);
  const rechazarSolicitud = ticket => resolverSolicitudReasignacionAction(ticket, "RECHAZAR", cargarDashboard, navigate);
  const seleccionarFiltro = filtro => {
    setFiltroEstado(filtro);
  };
  const ticketsFiltrados = useMemo(() => {
    if (filtroEstado === "reasignados") {
      return tickets.filter(ticket => ticket.solicitud_reasignacion_id);
    }
    const stateIds = {
      abierto: 1,
      cerrados: 2,
      proceso: 3,
      espera: 4,
      reabiertos: 5
    };
    const stateNames = {
      abierto: "ABIERTO",
      cerrados: "CERRADO",
      proceso: "EN PROCESO",
      espera: "EN ESPERA",
      reabiertos: "REABIERTO"
    };
    const stateId = stateIds[filtroEstado];
    if (!stateId) return tickets;

    return tickets.filter(ticket => {
      const stateName = String(ticket.estado ?? "").trim().toUpperCase();
      return Number(ticket.estado_id) === stateId || stateName === stateNames[filtroEstado];
    });
  }, [filtroEstado, tickets]);
  useEffect(() => {
    cargarDashboard();
  }, [cargarDashboard]);
  useRealtimeRefresh(["tickets", "solicitudes-reasignacion"], async () => {
    await cargarDashboard();
  });
  return {
    usuario,
    estadisticas,
    tickets,
    ticketsFiltrados,
    filtroEstado,
    seleccionarFiltro,
    verDetalle,
    tomarTicket,
    aceptarSolicitud,
    rechazarSolicitud
  };
}
export default useTecnico;
