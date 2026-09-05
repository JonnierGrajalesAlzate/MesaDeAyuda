import { useEffect, useState } from "react";
import { obtenerCategorias } from "../../../../tickets/services/catalogosService.js";

function useServicios() {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    obtenerCategorias().then(data => {
      if (!activo) return;
      const categorias = Array.isArray(data) ? data : [];
      setServicios(categorias.map(categoria => ({
        titulo: categoria.nombre,
        descripcion: categoria.descripcion || "Sin descripción disponible."
      })));
    }).catch(error => {
      console.error("Error cargando categorías:", error);
    }).finally(() => {
      if (activo) setCargando(false);
    });
    return () => {
      activo = false;
    };
  }, []);

  return { servicios, cargando };
}

export default useServicios;
