import FilterDisclosure from "../../../../../shared/ui/Filters/FilterDisclosure.jsx";
import BuscadorTickets from "./BuscadorTickets.jsx";
import SelectCategoria from "./SelectCategoria.jsx";
import SelectEstado from "./SelectEstado.jsx";
import SelectPrioridad from "./SelectPrioridad.jsx";
import SelectUsuario from "./SelectUsuario.jsx";

function PanelFiltros({
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
}) {
  return (
    <FilterDisclosure
      className="mb-6 tecnico-tickets-filter"
      title="Consultar tickets"
      description="Busca o combina filtros sobre los tickets que tienes asignados."
      onClose={limpiarFiltros}
    >
      <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_repeat(4,minmax(0,1fr))] xl:items-center">
        <BuscadorTickets valor={busqueda} onChange={setBusqueda} />
        <SelectCategoria categorias={categorias} valor={categoria} onChange={setCategoria} />
        <SelectEstado estados={estados} valor={estado} onChange={setEstado} />
        <SelectPrioridad prioridades={prioridades} valor={prioridad} onChange={setPrioridad} />
        <SelectUsuario usuarios={usuarios} valor={usuario} onChange={setUsuario} />
      </div>
    </FilterDisclosure>
  );
}

export default PanelFiltros;
