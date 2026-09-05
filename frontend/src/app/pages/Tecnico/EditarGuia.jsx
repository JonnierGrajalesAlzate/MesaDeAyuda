import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import BaseConocimientoEditorForm from "../../../features/base-conocimiento/components/BaseConocimientoEditorForm.jsx";
import { obtenerProcedimientoPorId } from "../../../features/base-conocimiento/services/procedimientosService.js";
import { obtenerCategorias } from "../../../features/tickets/services/catalogosService.js";
import PageLoader from "../../../shared/ui/loading/PageLoader.jsx";
import DashboardLayoutTecnico from "../../layouts/DashboardLayoutTecnico.jsx";
import DashboardLayoutAdministrador from "../../layouts/DashboardLayoutAdministrador.jsx";

function normalizeDetail(data) {
  return {
    ...data.procedimiento,
    archivos: data.archivos || []
  };
}

export default function EditarGuia({ layoutRole = "tecnico" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [initial, setInitial] = useState(null);
  const [ticketReferencia, setTicketReferencia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const basePath = layoutRole === "administrador" ? "/administrador/base-conocimiento" : "/baseConocimiento";
  const volver = () => navigate(`${basePath}/${id}`);
  const DashboardLayout = layoutRole === "administrador" ? DashboardLayoutAdministrador : DashboardLayoutTecnico;

  useEffect(() => {
    let active = true;
    Promise.all([obtenerProcedimientoPorId(id), obtenerCategorias()])
      .then(([detailData, categoriesResponse]) => {
        if (!active) return;
        setInitial(normalizeDetail(detailData));
        setTicketReferencia(detailData.ticket_referencia || null);
        setCategories(Array.isArray(categoriesResponse) ? categoriesResponse : categoriesResponse.categorias || []);
        setError("");
      })
      .catch(requestError => {
        if (!active) return;
        setError(requestError.response?.data?.message || "No se pudo cargar el artículo.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <PageLoader label="Cargando el artículo…" />;
  }

  return <DashboardLayout>
      <div className="space-y-5">
        <Link to={`${basePath}/${id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-[#0076e3]">
          <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current"><path d="m12 4-6 6 6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Regresar
        </Link>

        {error ? <div className="rounded border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div> : <div className="crud-detail-card">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-xl font-bold text-[#1e222b]">Editar guía</h2>
              <p className="mt-1 text-sm text-slate-500">
                Actualiza la información de este artículo.
              </p>
            </div>

            <div className="px-5 py-4">
              <BaseConocimientoEditorForm
                categories={categories}
                initial={initial}
                initialTicketReferencia={ticketReferencia}
                existingFiles={initial.archivos}
                editingId={Number(id)}
                onCancel={volver}
                onSaved={volver}
              />
            </div>
          </div>}
      </div>
    </DashboardLayout>;
}
