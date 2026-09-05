import FilterSearchInput from "../../../../../shared/ui/Filters/FilterSearchInput.jsx";

function BuscadorTickets({ valor, onChange }) {
  return (
    <FilterSearchInput
      value={valor}
      onChange={onChange}
      label="Buscar tickets asignados"
      placeholder="Buscar por título o descripción..."
    />
  );
}

export default BuscadorTickets;
