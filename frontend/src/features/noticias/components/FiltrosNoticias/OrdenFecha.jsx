import FilterDropdown from "../../../../shared/ui/Filters/FilterDropdown.jsx";

function OrdenFecha({ orden, setOrden }) {
  return (
    <FilterDropdown
      label="Ordenar"
      value={orden}
      onChange={setOrden}
      defaultValue="DESC"
      showCheckbox
      className="noticias-orden-filter"
      options={[
        { value: "DESC", label: "Más recientes" },
        { value: "ASC", label: "Más antiguas" }
      ]}
    />
  );
}

export default OrdenFecha;
