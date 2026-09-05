import FilterDropdown from "../../../../shared/ui/Filters/FilterDropdown.jsx";

function FiltroEtiqueta({ etiqueta, setEtiqueta, etiquetas }) {
  const options = [
    ...etiquetas.map(nombre => ({ value: nombre, label: nombre }))
  ];

  return (
    <FilterDropdown
      label="Etiqueta"
      value={etiqueta}
      onChange={setEtiqueta}
      options={options}
      multiple
    />
  );
}

export default FiltroEtiqueta;
