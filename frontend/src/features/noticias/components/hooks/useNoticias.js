import { useCallback, useEffect, useState } from "react";
import useRealtimeRefresh from "../../../../shared/hooks/useRealtimeRefresh.js";
import { cambiarEstadoNoticia, eliminarNoticia, eliminarNoticiaDefinitivamente, obtenerEstadosNoticia, obtenerNoticias } from "../../services/noticiasService.js";
import alerta from "../../../../shared/services/alertService.js";
import { alertaNoticiaEliminada, confirmarEliminarNoticia } from "../utils/noticiasAlerts.js";
function useNoticias() {
  const [noticias, setNoticias] = useState([]);
  const [estados, setEstados] = useState([]);
  const recargarNoticias = useCallback(async () => {
    try {
      setNoticias(await obtenerNoticias());
    } catch (error) {
      console.error("No se pudieron cargar las noticias", error);
    }
  }, []);
  useEffect(() => {
    let active = true;
    Promise.all([obtenerNoticias(), obtenerEstadosNoticia()]).then(([noticiasData, estadosData]) => {
      if (active) {
        setNoticias(noticiasData);
        setEstados(estadosData);
      }
    }).catch(error => {
      console.error("No se pudieron cargar las noticias", error);
    });
    return () => {
      active = false;
    };
  }, []);
  useRealtimeRefresh("noticias", recargarNoticias);
  const borrarNoticia = async noticia => {
    const result = await confirmarEliminarNoticia(noticia.titulo);
    if (!result.isConfirmed) return false;
    try {
      await eliminarNoticia(noticia.id);
      await alertaNoticiaEliminada();
      await recargarNoticias();
      return true;
    } catch (error) {
      console.error("No se pudo eliminar la noticia", error);
      return false;
    }
  };
  const cambiarEstado = async (noticia, estado) => {
    const nombreEstado = estado.nombre;
    const labels = {
      Publicada: { title: "¿Publicar noticia?", confirm: "Publicar" },
      Archivada: { title: "¿Archivar noticia?", confirm: "Archivar" },
      Eliminada: { title: "¿Enviar a eliminadas?", confirm: "Eliminar" }
    };
    const action = labels[nombreEstado] || { title: `¿Cambiar a ${nombreEstado}?`, confirm: "Cambiar estado" };
    const confirmation = await alerta.fire({
      icon: nombreEstado === "Eliminada" ? "warning" : "question",
      title: action.title,
      text: noticia.titulo,
      showCancelButton: true,
      confirmButtonText: action.confirm,
      cancelButtonText: "Cancelar",
      confirmButtonColor: estado.color_estado || "#0076e3"
    });
    if (!confirmation.isConfirmed) return false;

    try {
      const data = await cambiarEstadoNoticia(noticia.id, estado.id);
      await alerta.fire({ icon: "success", title: data.message, timer: 1400, showConfirmButton: false });
      await recargarNoticias();
      return true;
    } catch (error) {
      await alerta.fire({
        icon: "error",
        title: "No se pudo cambiar el estado",
        text: error.response?.data?.message || "Intenta nuevamente."
      });
      return false;
    }
  };
  const borrarDefinitivamente = async noticia => {
    const confirmation = await alerta.fire({
      icon: "warning",
      title: "¿Eliminar definitivamente?",
      text: `“${noticia.titulo}” se borrará de forma permanente y no podrá recuperarse.`,
      showCancelButton: true,
      confirmButtonText: "Eliminar definitivamente",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#b91c1c"
    });
    if (!confirmation.isConfirmed) return false;

    try {
      const data = await eliminarNoticiaDefinitivamente(noticia.id);
      await alerta.fire({ icon: "success", title: data.message, timer: 1400, showConfirmButton: false });
      await recargarNoticias();
      return true;
    } catch (error) {
      await alerta.fire({
        icon: "error",
        title: "No se pudo eliminar definitivamente",
        text: error.response?.data?.message || "Intenta nuevamente."
      });
      return false;
    }
  };
  return {
    noticias,
    estados,
    borrarNoticia,
    cambiarEstado,
    borrarDefinitivamente
  };
}
export default useNoticias;
