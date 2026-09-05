import { useNavigate } from "react-router-dom";
import PanelFiltros from "../Filtros/PanelFiltros.jsx";
import TicketsTablaTecnico from "../TicketsTablaTecnico.jsx";
function VistaTickets({
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
  limpiarFiltros,
  tickets
}) {
  const navigate = useNavigate();
  const verDetalle = ticket => navigate(`/estadisticas/tickets/${ticket.id}`);

  return <>
      <PanelFiltros busqueda={busqueda} setBusqueda={setBusqueda} estado={estado} setEstado={setEstado} prioridad={prioridad} setPrioridad={setPrioridad} categoria={categoria} setCategoria={setCategoria} usuario={usuario} setUsuario={setUsuario} estados={estados} prioridades={prioridades} categorias={categorias} usuarios={usuarios} limpiarFiltros={limpiarFiltros} />
      <TicketsTablaTecnico tickets={tickets} onVerDetalle={verDetalle} />
    </>;
}
export default VistaTickets;
