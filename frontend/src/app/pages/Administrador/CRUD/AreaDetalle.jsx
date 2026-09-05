import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import alerta from "../../../../shared/services/alertService.js";
import DashboardLayout from "../../../layouts/DashboardLayoutAdministrador.jsx";
import AreaFormulario from "../../../../features/administrador/components/CRUD/AreaFormulario.jsx";
import { listarUsuarios, obtenerCatalogosUsuarios } from "../../../../features/administrador/services/CRUD/usuariosService.js";

function AreaDetalleContenido({ id, modo }) {
  const navigate = useNavigate();
  const [area, setArea] = useState(null);
  const [usuariosDelArea, setUsuariosDelArea] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([listarUsuarios(), obtenerCatalogosUsuarios()]).then(([usersData, catalogsData]) => {
      if (!active) return;
      const usuarios = usersData.usuarios || [];
      if (id) {
        const found = (catalogsData.areas || []).find(item => String(item.id) === String(id));
        if (!found) {
          setNotFound(true);
        } else {
          setArea(found);
          setUsuariosDelArea(usuarios.filter(usuario => String(usuario.area_id) === String(id)));
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
        <p className="text-lg font-bold text-[#1e222b]">Área no encontrada</p>
        <p className="mt-1 text-sm text-slate-500">Puede que ya haya sido eliminada o el enlace esté desactualizado.</p>
      </div> : <AreaFormulario
        area={area}
        usuarios={usuariosDelArea}
        modo={modo}
        onCancel={() => navigate(area ? `/usuarios/areas/${area.id}` : "/usuarios")}
        onSaved={() => navigate("/usuarios")}
      />}
  </div>;
}

export default function AreaDetalle({ modo }) {
  const { id } = useParams();
  return <DashboardLayout>
    <AreaDetalleContenido key={id || "nueva"} id={id} modo={modo} />
  </DashboardLayout>;
}
