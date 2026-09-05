import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import BaseConocimientoEditorForm from "../../../features/base-conocimiento/components/BaseConocimientoEditorForm.jsx";
import { obtenerCategorias } from "../../../features/tickets/services/catalogosService.js";
import DashboardLayoutTecnico from "../../layouts/DashboardLayoutTecnico.jsx";
import DashboardLayoutAdministrador from "../../layouts/DashboardLayoutAdministrador.jsx";

export default function CrearGuia({ layoutRole = "tecnico" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const ticketReferencia = location.state?.ticketReferencia || null;
  const [categories, setCategories] = useState([]);
  const basePath = layoutRole === "administrador" ? "/administrador/base-conocimiento" : "/baseConocimiento";
  const DashboardLayout = layoutRole === "administrador" ? DashboardLayoutAdministrador : DashboardLayoutTecnico;

  useEffect(() => {
    let active = true;
    obtenerCategorias().then(response => {
      if (!active) return;
      setCategories(Array.isArray(response) ? response : response.categorias || []);
    }).catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return <DashboardLayout>
      <div className="space-y-5">
        <Link to={basePath} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-[#0076e3]">
          <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current"><path d="m12 4-6 6 6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Regresar
        </Link>

        <div className="crud-detail-card">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-xl font-bold text-[#1e222b]">Nueva guía</h2>
            <p className="mt-1 text-sm text-slate-500">
              Registra un nuevo artículo para la base de conocimiento.
            </p>
          </div>

          <div className="px-5 py-4">
            <BaseConocimientoEditorForm
              categories={categories}
              initial={ticketReferencia ? {
                ticket_referencia_id: ticketReferencia.id,
                titulo: ticketReferencia.titulo,
                categoria_id: ticketReferencia.categoria_id,
                descripcion: ticketReferencia.descripcion
              } : undefined}
              initialTicketReferencia={ticketReferencia}
              onCancel={() => navigate(basePath)}
              onSaved={articleId => navigate(`${basePath}/${articleId}`)}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>;
}
