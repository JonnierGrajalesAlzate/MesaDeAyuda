import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import alerta from "../../../../shared/services/alertService.js";
import DashboardLayout from "../../../layouts/DashboardLayoutAdministrador.jsx";
import CategoriaFormulario from "../../../../features/administrador/components/CRUD/CategoriaFormulario.jsx";
import { obtenerCategorias, obtenerPrioridades } from "../../../../features/tickets/services/catalogosService.js";

function CategoriaDetalleContenido({ id, modo }) {
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState(null);
  const [prioridades, setPrioridades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([obtenerCategorias(), obtenerPrioridades()]).then(([categoriasData, prioridadesData]) => {
      if (!active) return;
      setPrioridades(prioridadesData || []);
      if (id) {
        const found = (categoriasData || []).find(item => String(item.id) === String(id));
        if (!found) {
          setNotFound(true);
        } else {
          setCategoria(found);
        }
      }
    }).catch(() => {
      if (active) alerta.fire({
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
    <Link to="/usuarios" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-[#0076e3]">
      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current"><path d="m12 4-6 6 6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      Regresar
    </Link>

    {loading ? <p className="p-8 text-center text-slate-500">Cargando…</p> : notFound ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-lg font-bold text-[#1e222b]">Categoría no encontrada</p>
        <p className="mt-1 text-sm text-slate-500">Puede que ya haya sido eliminada o el enlace esté desactualizado.</p>
      </div> : <CategoriaFormulario
        categoria={categoria}
        modo={modo}
        prioridades={prioridades}
        onCancel={() => navigate(categoria ? `/usuarios/categorias/${categoria.id}` : "/usuarios")}
        onSaved={() => navigate("/usuarios")}
      />}
  </div>;
}

export default function CategoriaDetalle({ modo }) {
  const { id } = useParams();
  return <DashboardLayout>
    <CategoriaDetalleContenido key={id || "nueva"} id={id} modo={modo} />
  </DashboardLayout>;
}
