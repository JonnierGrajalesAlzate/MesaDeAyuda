import FilterDisclosure from "../../../../shared/ui/Filters/FilterDisclosure.jsx";
import FilterDropdown from "../../../../shared/ui/Filters/FilterDropdown.jsx";
import FilterSearchInput from "../../../../shared/ui/Filters/FilterSearchInput.jsx";

function TicketsFiltros({
  filtroTexto,
  setFiltroTexto,
  filtroEstado,
  setFiltroEstado,
  filtroPrioridad,
  setFiltroPrioridad,
  filtroCategoria,
  setFiltroCategoria,
  estados = [],
  prioridades = [],
  categorias = []
}) {
  const estadoOptions = [
    ...estados.map(estado => ({ value: estado.nombre, label: estado.nombre }))
  ];
  const prioridadOptions = [
    ...prioridades.map(prioridad => ({ value: prioridad.nombre, label: prioridad.nombre }))
  ];
  const categoriaOptions = [
    ...categorias.map(categoria => ({ value: categoria.nombre, label: categoria.nombre }))
  ];

  return (
    <FilterDisclosure
      className="mt-6 usuario-tickets-filter"
      title="Consultar mis tickets"
      description="Busca tus solicitudes por título, descripción, categoría, prioridad o estado."
    >
      <div className="flex flex-wrap items-center gap-3">
        <FilterSearchInput
          className="min-w-56 flex-1 basis-56"
          value={filtroTexto}
          onChange={setFiltroTexto}
          label="Buscar tickets"
          placeholder="Buscar por título o descripción..."
        />
        <FilterDropdown
          className="min-w-40 flex-1 basis-40"
          fill
          label="Estado"
          value={filtroEstado}
          onChange={setFiltroEstado}
          options={estadoOptions}
          multiple
        />
        <FilterDropdown
          className="min-w-40 flex-1 basis-40"
          fill
          label="Prioridad"
          value={filtroPrioridad}
          onChange={setFiltroPrioridad}
          options={prioridadOptions}
          multiple
        />
        <FilterDropdown
          className="min-w-40 flex-1 basis-40"
          fill
          label="Categoría"
          value={filtroCategoria}
          onChange={setFiltroCategoria}
          options={categoriaOptions}
          multiple
        />
      </div>
    </FilterDisclosure>
  );
}

export default TicketsFiltros;
