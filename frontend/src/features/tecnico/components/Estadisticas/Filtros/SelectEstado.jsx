import FilterDropdown from "../../../../../shared/ui/Filters/FilterDropdown.jsx";

function SelectEstado({ estados, valor, onChange }) {
  return (
    <FilterDropdown
      label="Estado"
      value={valor}
      onChange={onChange}
      options={[
        ...estados.map(estado => ({ value: estado, label: estado }))
      ]}
      multiple
    />
  );
}

export default SelectEstado;
