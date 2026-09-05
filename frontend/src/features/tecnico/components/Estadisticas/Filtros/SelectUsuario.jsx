import FilterDropdown from "../../../../../shared/ui/Filters/FilterDropdown.jsx";

function SelectUsuario({ usuarios, valor, onChange }) {
  return (
    <FilterDropdown
      label="Usuario"
      value={valor}
      onChange={onChange}
      options={[
        ...usuarios.map(usuario => ({ value: usuario, label: usuario }))
      ]}
      multiple
    />
  );
}

export default SelectUsuario;
