import FilterDropdown from "../../../../../shared/ui/Filters/FilterDropdown.jsx";

function SelectCategoria({ categorias, valor, onChange }) {
  return (
    <FilterDropdown
      label="Categoría"
      value={valor}
      onChange={onChange}
      options={[
        ...categorias.map(categoria => ({ value: categoria, label: categoria }))
      ]}
      multiple
    />
  );
}

export default SelectCategoria;
