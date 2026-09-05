import { useMemo, useState } from "react";
export default function useFiltrosTickets(tickets = []) {
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState([]);
  const [prioridad, setPrioridad] = useState([]);
  const [categoria, setCategoria] = useState([]);
  const [usuario, setUsuario] = useState([]);
  const estados = useMemo(() => {
    return [...new Set(tickets.map(ticket => ticket.estado))].sort();
  }, [tickets]);
  const prioridades = useMemo(() => {
    return [...new Set(tickets.map(ticket => ticket.prioridad))].sort();
  }, [tickets]);
  const categorias = useMemo(() => {
    return [...new Set(tickets.map(ticket => ticket.categoria))].sort();
  }, [tickets]);
  const usuarios = useMemo(() => {
    return [...new Set(tickets.map(ticket => ticket.usuario))].sort();
  }, [tickets]);
  const ticketsFiltrados = useMemo(() => {
    return tickets.filter(ticket => {
      const texto = busqueda.toLowerCase();
      const coincideBusqueda = ticket.titulo.toLowerCase().includes(texto) || (ticket.descripcion || "").toLowerCase().includes(texto);
      const coincideEstado = !estado.length || estado.includes(ticket.estado);
      const coincidePrioridad = !prioridad.length || prioridad.includes(ticket.prioridad);
      const coincideCategoria = !categoria.length || categoria.includes(ticket.categoria);
      const coincideUsuario = !usuario.length || usuario.includes(ticket.usuario);
      return coincideBusqueda && coincideEstado && coincidePrioridad && coincideCategoria && coincideUsuario;
    });
  }, [tickets, busqueda, estado, prioridad, categoria, usuario]);
  function limpiarFiltros() {
    setBusqueda("");
    setEstado([]);
    setPrioridad([]);
    setCategoria([]);
    setUsuario([]);
  }
  return {
    ticketsFiltrados,
    busqueda,
    setBusqueda,
    estado,
    setEstado,
    prioridad,
    setPrioridad,
    categoria,
    setCategoria,
    usuario,
    setUsuario,
    estados,
    prioridades,
    categorias,
    usuarios,
    limpiarFiltros
  };
}
