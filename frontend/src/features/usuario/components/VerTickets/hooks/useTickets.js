import { useCallback, useEffect, useMemo, useState } from "react";
import { TodosTickets } from "../../../../tickets/services/ticketService.js";
import useRealtimeRefresh from "../../../../../shared/hooks/useRealtimeRefresh.js";
import { obtenerEstados, obtenerPrioridades, obtenerCategorias } from "../../../../tickets/services/catalogosService.js";
function useTickets() {
  const usuario = JSON.parse(localStorage.getItem("usuario")) || {};
  const [tickets, setTickets] = useState([]);
  const [estados, setEstados] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroEstado, setFiltroEstado] = useState([]);
  const [filtroPrioridad, setFiltroPrioridad] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState([]);
  const cargarTickets = useCallback(async ({
    silencioso = false
  } = {}) => {
    try {
      if (!silencioso) setLoading(true);
      const data = await TodosTickets(usuario.id);
      setTickets(data);
    } catch (error) {
      console.error("Error cargando tickets:", error);
    } finally {
      if (!silencioso) setLoading(false);
    }
  }, [usuario.id]);
  useEffect(() => {
    // Carga inicial del recurso externo al montar la vista.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarTickets();
  }, [cargarTickets]);
  useEffect(() => {
    let activo = true;
    obtenerEstados().then(data => {
      if (activo) setEstados(Array.isArray(data) ? data : []);
    }).catch(error => console.error("Error cargando estados:", error));
    return () => {
      activo = false;
    };
  }, []);
  useEffect(() => {
    let activo = true;
    obtenerPrioridades().then(data => {
      if (activo) setPrioridades(Array.isArray(data) ? data : []);
    }).catch(error => console.error("Error cargando prioridades:", error));
    return () => {
      activo = false;
    };
  }, []);
  useEffect(() => {
    let activo = true;
    obtenerCategorias().then(data => {
      if (activo) setCategorias(Array.isArray(data) ? data : []);
    }).catch(error => console.error("Error cargando categorías:", error));
    return () => {
      activo = false;
    };
  }, []);
  useRealtimeRefresh("tickets", async () => {
    await cargarTickets({
      silencioso: true
    });
  });
  const ticketsFiltrados = useMemo(() => {
    return tickets.filter(ticket => {
      const texto = filtroTexto.toLowerCase();
      const coincideTexto = ticket.titulo.toLowerCase().includes(texto) || (ticket.descripcion || "").toLowerCase().includes(texto) || ticket.categoria.toLowerCase().includes(texto) || String(ticket.id).includes(texto);
      const coincideEstado = !filtroEstado.length || filtroEstado.some(estado => ticket.estado.toLowerCase() === estado.toLowerCase());
      const coincidePrioridad = !filtroPrioridad.length || filtroPrioridad.some(prioridad => ticket.prioridad.toLowerCase() === prioridad.toLowerCase());
      const coincideCategoria = !filtroCategoria.length || filtroCategoria.some(categoria => ticket.categoria.toLowerCase() === categoria.toLowerCase());
      return coincideTexto && coincideEstado && coincidePrioridad && coincideCategoria;
    });
  }, [tickets, filtroTexto, filtroEstado, filtroPrioridad, filtroCategoria]);
  return {
    loading,
    tickets,
    estados,
    prioridades,
    categorias,
    ticketsFiltrados,
    filtroTexto,
    setFiltroTexto,
    filtroEstado,
    setFiltroEstado,
    filtroPrioridad,
    setFiltroPrioridad,
    filtroCategoria,
    setFiltroCategoria,
    cargarTickets
  };
}
export default useTickets;
