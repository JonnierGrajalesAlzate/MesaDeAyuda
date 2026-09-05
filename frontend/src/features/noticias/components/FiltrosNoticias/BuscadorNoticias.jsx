import FilterSearchInput from "../../../../shared/ui/Filters/FilterSearchInput.jsx";

function BuscadorNoticias({ busqueda, setBusqueda }) {
  return (
    <FilterSearchInput
      value={busqueda}
      onChange={setBusqueda}
      label="Buscar noticia"
      placeholder="Título o descripción..."
    />
  );
}

export default BuscadorNoticias;
