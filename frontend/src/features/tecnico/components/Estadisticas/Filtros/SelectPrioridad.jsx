import FilterDropdown from "../../../../../shared/ui/Filters/FilterDropdown.jsx";

function SelectPrioridad({ prioridades, valor, onChange }) {
  return (
    <FilterDropdown
      label="Prioridad"
      value={valor}
      onChange={onChange}
      options={[
        ...prioridades.map(prioridad => ({ value: prioridad, label: prioridad }))
      ]}
      multiple
    />
  );
}

export default SelectPrioridad;
