import FilterDisclosure from "../../../../shared/ui/Filters/FilterDisclosure.jsx";
import BuscadorNoticias from "./BuscadorNoticias.jsx";
import FiltroAutor from "./FiltroAutor.jsx";
import FiltroEtiqueta from "./FiltroEtiqueta.jsx";
import OrdenFecha from "./OrdenFecha.jsx";

function BarraFiltrosNoticias({
  busqueda,
  setBusqueda,
  etiqueta,
  setEtiqueta,
  etiquetas,
  autor,
  setAutor,
  autores,
  orden,
  setOrden,
  limpiarFiltros
}) {
  return (
    <FilterDisclosure
      className="mb-6 noticias-filter"
      title="Consultar noticias"
      description="Busca por palabras clave y filtra por etiqueta, autor u orden de publicación."
      onClose={limpiarFiltros}
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4 xl:items-center [&>*]:min-w-0 [&>*]:w-full">
        <BuscadorNoticias busqueda={busqueda} setBusqueda={setBusqueda} />
        <FiltroEtiqueta etiqueta={etiqueta} setEtiqueta={setEtiqueta} etiquetas={etiquetas} />
        <FiltroAutor autor={autor} setAutor={setAutor} autores={autores} />
        <OrdenFecha orden={orden} setOrden={setOrden} />
      </div>
    </FilterDisclosure>
  );
}

export default BarraFiltrosNoticias;
