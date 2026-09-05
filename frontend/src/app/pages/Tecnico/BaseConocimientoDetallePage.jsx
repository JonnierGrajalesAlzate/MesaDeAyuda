import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import alerta from "../../../shared/services/alertService.js";
import BaseConocimientoDetail from "../../../features/base-conocimiento/components/BaseConocimientoDetail.jsx";
import useRealtimeRefresh from "../../../shared/hooks/useRealtimeRefresh.js";
import PageLoader from "../../../shared/ui/loading/PageLoader.jsx";
import DashboardLayoutTecnico from "../../layouts/DashboardLayoutTecnico.jsx";
import DashboardLayoutAdministrador from "../../layouts/DashboardLayoutAdministrador.jsx";
import { archivarProcedimiento, crearNotaProcedimiento, eliminarProcedimiento, obtenerProcedimientoPorId, publicarProcedimiento, restaurarProcedimiento } from "../../../features/base-conocimiento/services/procedimientosService.js";

const CONFIRMATION_COPY = {
  publish: {
    title: "¿Publicar este artículo?",
    text: "El artículo quedará disponible para los demás técnicos.",
    confirmButtonText: "Sí, publicar"
  },
  archive: {
    title: "¿Archivar este artículo?",
    text: "El artículo dejará de aparecer entre las publicaciones activas.",
    confirmButtonText: "Sí, archivar"
  },
  delete: {
    title: "¿Eliminar este artículo?",
    text: "Se moverá a la carpeta Eliminadas y podrás restaurarlo después.",
    confirmButtonText: "Sí, eliminar"
  }
};
const SUCCESS_COPY = {
  publish: "Publicado exitosamente",
  archive: "Archivado exitosamente",
  delete: "Movido a Eliminadas",
  restore: "Restaurado exitosamente"
};

function authenticatedUserId() {
  return Number(JSON.parse(localStorage.getItem("usuario") || "null")?.id);
}
function normalizeDetail(data) {
  return {
    ...data.procedimiento,
    archivos: data.archivos || [],
    notasAdicionales: data.notas_adicionales || []
  };
}

export default function BaseConocimientoDetallePage({ layoutRole = "tecnico" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUserId = authenticatedUserId();
  const [detail, setDetail] = useState(null);
  const [ticketReferencia, setTicketReferencia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const basePath = layoutRole === "administrador" ? "/administrador/base-conocimiento" : "/baseConocimiento";
  const volver = () => navigate(basePath);
  const isOwn = useCallback(article => Number(article?.autor_id) === currentUserId, [currentUserId]);

  const refreshDetail = useCallback(async () => {
    const data = await obtenerProcedimientoPorId(id);
    setDetail(normalizeDetail(data));
    setTicketReferencia(data.ticket_referencia || null);
  }, [id]);

  useEffect(() => {
    let active = true;
    obtenerProcedimientoPorId(id)
      .then(data => {
        if (!active) return;
        setDetail(normalizeDetail(data));
        setTicketReferencia(data.ticket_referencia || null);
        setError("");
      })
      .catch(requestError => {
        if (!active) return;
        setDetail(null);
        setError(requestError.response?.data?.message || "No se pudo cargar el artículo.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  useRealtimeRefresh("base-conocimiento", async () => {
    try {
      await refreshDetail();
    } catch {
      volver();
    }
  }, 500);

  const runAction = async (type, operation) => {
    if (["publish", "archive", "delete", "restore"].includes(type) && !isOwn(detail)) {
      return;
    }
    const confirmation = CONFIRMATION_COPY[type];
    if (confirmation) {
      const result = await alerta.fire({
        icon: "warning",
        ...confirmation,
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        confirmButtonColor: type === "delete" ? "#dc2626" : "#0076e3",
        cancelButtonColor: "#c3cfdb"
      });
      if (!result.isConfirmed) return;
    }
    try {
      await operation();
      if (["delete", "restore"].includes(type)) {
        await alerta.fire({
          icon: "success",
          title: SUCCESS_COPY[type] || "Operación exitosa",
          timer: 1600,
          showConfirmButton: false
        });
        volver();
        return;
      }
      await refreshDetail();
      if (SUCCESS_COPY[type]) {
        await alerta.fire({
          icon: "success",
          title: SUCCESS_COPY[type],
          timer: 1600,
          showConfirmButton: false
        });
      }
    } catch (actionError) {
      await alerta.fire({
        icon: "error",
        title: "No se pudo completar la operación",
        text: actionError.response?.data?.message || "Intenta nuevamente.",
        confirmButtonColor: "#0076e3"
      });
    }
  };

  const startEdit = () => {
    if (!detail || !isOwn(detail)) return;
    navigate(`${basePath}/editar-guia/${detail.id}`);
  };

  const addNote = async () => {
    const result = await alerta.fire({
      icon: "question",
      title: "Dejar una nota",
      text: "Complementa esta guía si notas que faltan detalles.",
      input: "textarea",
      inputLabel: "Nota",
      inputPlaceholder: "Escribe aquí los detalles que faltan…",
      showCancelButton: true,
      confirmButtonText: "Guardar nota",
      cancelButtonText: "Cancelar",
      inputValidator: value => !value?.trim() ? "Escribe una nota antes de guardar." : undefined
    });
    if (!result.isConfirmed) return;
    try {
      await crearNotaProcedimiento(detail.id, result.value.trim());
      await refreshDetail();
    } catch (actionError) {
      await alerta.fire({
        icon: "error",
        title: "No se pudo guardar la nota",
        text: actionError.response?.data?.message || "Intenta nuevamente."
      });
    }
  };

  const DashboardLayout = layoutRole === "administrador"
    ? DashboardLayoutAdministrador
    : DashboardLayoutTecnico;

  if (loading) {
    return <PageLoader label="Cargando el artículo…" />;
  }

  return <DashboardLayout>
      <div className="bc-page flex flex-col lg:h-[calc(100vh-110px)]">
        {error && <div className="flex h-full flex-col items-center justify-center gap-3 border bg-white p-10 text-center shadow-sm">
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button type="button" onClick={volver} className="bg-[#0076e3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#005fbd]">
              Volver a Base de conocimiento
            </button>
          </div>}

        {!error && detail && <section className="flex h-full flex-col overflow-hidden border bg-white shadow-sm">
            <BaseConocimientoDetail
              detail={detail}
              ticketReferencia={ticketReferencia}
              notas={detail.notasAdicionales}
              isOwner={isOwn(detail)}
              onBack={volver}
              onEdit={startEdit}
              onPublish={() => runAction("publish", () => publicarProcedimiento(detail.id))}
              onArchive={() => runAction("archive", () => archivarProcedimiento(detail.id))}
              onDelete={() => runAction("delete", () => eliminarProcedimiento(detail.id))}
              onRestore={() => runAction("restore", () => restaurarProcedimiento(detail.id))}
              onAddNote={addNote}
            />
          </section>}
      </div>
    </DashboardLayout>;
}
