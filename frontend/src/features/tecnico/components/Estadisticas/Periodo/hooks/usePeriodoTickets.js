import { useMemo, useState } from "react";
export default function usePeriodoTickets(tickets = []) {
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [periodoAplicado, setPeriodoAplicado] = useState({
    inicio: null,
    fin: null
  });
  function buscarPeriodo() {
    setPeriodoAplicado({
      inicio: fechaInicio,
      fin: fechaFin
    });
  }
  function limpiarPeriodo() {
    setFechaInicio(null);
    setFechaFin(null);
    setPeriodoAplicado({
      inicio: null,
      fin: null
    });
  }
  const ticketsPeriodo = useMemo(() => {
    if (!periodoAplicado.inicio || !periodoAplicado.fin) {
      return tickets;
    }
    const inicio = new Date(periodoAplicado.inicio);
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(periodoAplicado.fin);
    fin.setHours(23, 59, 59, 999);
    return tickets.filter(ticket => {
      const fechaTicket = new Date(ticket.fecha_creacion);
      return fechaTicket >= inicio && fechaTicket <= fin;
    });
  }, [tickets, periodoAplicado]);
  const totalTickets = ticketsPeriodo.length;
  const cerrados = ticketsPeriodo.filter(ticket => ticket.estado === "CERRADO").length;
  const enProceso = ticketsPeriodo.filter(ticket => ticket.estado === "EN PROCESO").length;
  const pendientes = ticketsPeriodo.filter(ticket => ticket.estado === "ABIERTO" || ticket.estado === "EN ESPERA").length;
  const reabiertos = ticketsPeriodo.filter(ticket => ticket.estado === "REABIERTO").length;
  const tiempoPromedio = useMemo(() => {
    const ticketsResueltos = ticketsPeriodo.filter(ticket => ticket.fecha_cierre);
    if (ticketsResueltos.length === 0) {
      return "Pendiente";
    }
    const totalMinutos = ticketsResueltos.reduce((acumulador, ticket) => {
      const inicio = new Date(ticket.fecha_creacion);
      const fin = new Date(ticket.fecha_cierre);
      return acumulador + (fin - inicio) / 60000;
    }, 0);
    const promedio = Math.round(totalMinutos / ticketsResueltos.length);
    const dias = Math.floor(promedio / 1440);
    const horas = Math.floor(promedio % 1440 / 60);
    const minutos = promedio % 60;
    if (dias > 0) {
      return `${dias} d ${horas} h`;
    }
    if (horas > 0) {
      return `${horas} h ${minutos} min`;
    }
    return `${minutos} min`;
  }, [ticketsPeriodo]);
  return {
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    ticketsPeriodo,
    buscarPeriodo,
    limpiarPeriodo,
    totalTickets,
    cerrados,
    enProceso,
    pendientes,
    reabiertos,
    tiempoPromedio
  };
}
