import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import alerta from "../../../shared/services/alertService.js";
import DashboardLayoutTecnico from "../../layouts/DashboardLayoutTecnico.jsx";
import DashboardLayoutAdministrador from "../../layouts/DashboardLayoutAdministrador.jsx";
import NoticiaFormulario from "../../../features/noticias/components/NoticiaFormulario.jsx";
import { obtenerEstadosNoticia, obtenerEtiquetas, obtenerNoticiaPorId } from "../../../features/noticias/services/noticiasService.js";

function NoticiaDetalleContenido({ id, modo, basePath }) {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const [noticia, setNoticia] = useState(null);
  const [etiquetas, setEtiquetas] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([obtenerEtiquetas(), obtenerEstadosNoticia(), id ? obtenerNoticiaPorId(id) : Promise.resolve(null)]).then(([etiquetasData, estadosData, noticiaData]) => {
      if (!active) return;
      setEtiquetas(etiquetasData || []);
      setEstados(estadosData || []);
      if (id) {
        if (!noticiaData?.noticia) {
          setNotFound(true);
        } else {
          setNoticia(noticiaData.noticia);
        }
      }
    }).catch(() => {
      if (!active) return;
      if (id) setNotFound(true);
      alerta.fire({
        icon: "error",
        title: "No se pudo cargar la información"
      });
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id]);

  return <div className="space-y-5">
    <Link to={basePath} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-[#0076e3]">
      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current"><path d="m12 4-6 6 6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      Regresar
    </Link>

    {loading ? <p className="p-8 text-center text-slate-500">Cargando…</p> : notFound ? <div className="rounded border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-lg font-bold text-[#1e222b]">Noticia no encontrada</p>
        <p className="mt-1 text-sm text-slate-500">Puede que ya haya sido eliminada o el enlace esté desactualizado.</p>
      </div> : <NoticiaFormulario
        noticia={noticia}
        etiquetas={etiquetas}
        estados={estados}
        modo={modo}
        usuarioId={usuario.id}
        onCancel={() => navigate(basePath)}
        onSaved={() => navigate(basePath)}
      />}
  </div>;
}

export default function NoticiaDetalle({ modo, layoutRole = "tecnico" }) {
  const { id } = useParams();
  const DashboardLayout = layoutRole === "administrador"
    ? DashboardLayoutAdministrador
    : DashboardLayoutTecnico;
  const basePath = layoutRole === "administrador" ? "/administrador/noticias" : "/noticias";

  return <DashboardLayout>
    <NoticiaDetalleContenido key={id || "nueva"} id={id} modo={modo} basePath={basePath} />
  </DashboardLayout>;
}
