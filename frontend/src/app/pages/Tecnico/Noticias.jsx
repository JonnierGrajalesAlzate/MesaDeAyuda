import DashboardLayoutTecnico from "../../layouts/DashboardLayoutTecnico.jsx";
import DashboardLayoutAdministrador from "../../layouts/DashboardLayoutAdministrador.jsx";
import EncabezadoNoticias from "../../../features/noticias/components/EncabezadoNoticias.jsx";
import TablaNoticias from "../../../features/noticias/components/TablaNoticias/TablaNoticias.jsx";
import BarraFiltrosNoticias from "../../../features/noticias/components/FiltrosNoticias/BarraFiltrosNoticias.jsx";
import useFiltroNoticias from "../../../features/noticias/components/FiltrosNoticias/useFiltroNoticias.js";
import useNoticias from "../../../features/noticias/components/hooks/useNoticias.js";
import EstadoNoticiasTabs from "../../../features/noticias/components/EstadoNoticiasTabs.jsx";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
function Noticias({ layoutRole = "tecnico" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const puedeGestionar = usuario.rol === "Tecnico" || usuario.rol === "Administrador";
  const basePath = layoutRole === "administrador" ? "/administrador/noticias" : "/noticias";
  const [estadoVista, setEstadoVista] = useState(null);
  const {
    noticias,
    estados,
    borrarNoticia,
    cambiarEstado,
    borrarDefinitivamente
  } = useNoticias();
  const crear = () => navigate(`${basePath}/nueva`);
  const ver = noticia => navigate(`${basePath}/${noticia.id}`);
  const editar = noticia => navigate(`${basePath}/${noticia.id}/editar`);
  const estadoSeleccionado = estadoVista
    ?? estados.find(estado => estado.nombre === "Publicada")?.id
    ?? estados[0]?.id
    ?? null;
  const counts = useMemo(() => noticias.reduce((result, noticia) => {
    const estadoId = Number(noticia.estado_id);
    if (estadoId) result[estadoId] = (result[estadoId] || 0) + 1;
    return result;
  }, {}), [noticias]);
  const noticiasEstado = useMemo(
    () => noticias.filter(noticia => Number(noticia.estado_id) === Number(estadoSeleccionado)),
    [noticias, estadoSeleccionado]
  );
  const {
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
  } = useFiltroNoticias(noticiasEstado);
  useEffect(() => {
    const noticiaId = Number(new URLSearchParams(location.search).get("noticia"));
    if (!Number.isSafeInteger(noticiaId) || noticiaId < 1) return undefined;
    const frame = window.requestAnimationFrame(() => {
      const fila = document.querySelector(`[data-noticia-id="${noticiaId}"]`);
      fila?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
      fila?.focus({
        preventScroll: true
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.key, location.search, noticiasFiltradas.length]);
  const DashboardLayout = layoutRole === "administrador"
    ? DashboardLayoutAdministrador
    : DashboardLayoutTecnico;

  return <DashboardLayout>

            <div className="noticias-page space-y-8">

                <EncabezadoNoticias onNueva={puedeGestionar ? crear : null} />

                <EstadoNoticiasTabs value={estadoSeleccionado} counts={counts} estados={estados} onChange={setEstadoVista} />

                <BarraFiltrosNoticias busqueda={busqueda} setBusqueda={setBusqueda} etiqueta={etiqueta} setEtiqueta={setEtiqueta} etiquetas={etiquetas} autor={autor} setAutor={setAutor} autores={autores} orden={orden} setOrden={setOrden} limpiarFiltros={limpiarFiltros} />

                <TablaNoticias noticias={noticiasFiltradas} estados={estados} usuarioActual={usuario} onVer={puedeGestionar ? ver : null} onEditar={puedeGestionar ? editar : null} onEliminar={puedeGestionar ? borrarNoticia : null} onCambiarEstado={puedeGestionar ? cambiarEstado : null} onEliminarDefinitivamente={puedeGestionar ? borrarDefinitivamente : null} />

            </div>

        </DashboardLayout>;
}
export default Noticias;
