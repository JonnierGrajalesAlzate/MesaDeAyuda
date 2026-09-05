import { useMemo, useState } from "react";
function useFiltroNoticias(noticias = []) {
  const [busqueda, setBusqueda] = useState("");
  const [etiqueta, setEtiqueta] = useState([]);
  const [autor, setAutor] = useState([]);
  const [orden, setOrden] = useState("DESC");

  //==========================
  // Etiquetas disponibles
  //==========================

  const etiquetas = useMemo(() => {
    const lista = noticias.map(noticia => noticia.etiqueta).filter(Boolean);
    return [...new Set(lista)].sort();
  }, [noticias]);

  //==========================
  // Autores disponibles
  //==========================

  const autores = useMemo(() => {
    const lista = noticias.map(noticia => `${noticia.nombre} ${noticia.apellido}`).filter(Boolean);
    return [...new Set(lista)].sort();
  }, [noticias]);

  //==========================
  // Noticias filtradas
  //==========================

  const noticiasFiltradas = useMemo(() => {
    let resultado = [...noticias];

    // Buscar por título o descripción

    if (busqueda.trim() !== "") {
      const texto = busqueda.toLowerCase();
      resultado = resultado.filter(noticia => noticia.titulo?.toLowerCase().includes(texto) || noticia.descripcion?.toLowerCase().includes(texto));
    }

    // Filtrar por etiqueta

    if (etiqueta.length) {
      resultado = resultado.filter(noticia => etiqueta.includes(noticia.etiqueta));
    }

    // Filtrar por autor

    if (autor.length) {
      resultado = resultado.filter(noticia => autor.includes(`${noticia.nombre} ${noticia.apellido}`));
    }

    // Ordenar por fecha

    resultado.sort((a, b) => {
      const fechaA = new Date(a.fecha_creacion);
      const fechaB = new Date(b.fecha_creacion);
      return orden === "DESC" ? fechaB - fechaA : fechaA - fechaB;
    });
    return resultado;
  }, [noticias, busqueda, etiqueta, autor, orden]);

  //==========================
  // Limpiar filtros
  //==========================

  const limpiarFiltros = () => {
    setBusqueda("");
    setEtiqueta([]);
    setAutor([]);
    setOrden("DESC");
  };
  return {
    noticiasFiltradas,
    etiquetas,
    autores,
    busqueda,
    etiqueta,
    autor,
    orden,
    setBusqueda,
    setEtiqueta,
    setAutor,
    setOrden,
    limpiarFiltros
  };
}
export default useFiltroNoticias;
