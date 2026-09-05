import FilterDropdown from "../../../../shared/ui/Filters/FilterDropdown.jsx";

function FiltroAutor({ autor, setAutor, autores }) {
  const options = [
    ...autores.map(nombreAutor => ({ value: nombreAutor, label: nombreAutor }))
  ];

  return (
    <FilterDropdown
      label="Autor"
      value={autor}
      onChange={setAutor}
      options={options}
      multiple
    />
  );
}

export default FiltroAutor;
