import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import alerta from "../../../../shared/services/alertService.js";
import DashboardLayout from "../../../layouts/DashboardLayoutAdministrador.jsx";
import UsuarioFormulario from "../../../../features/administrador/components/CRUD/UsuarioFormulario.jsx";
import { listarUsuarios, obtenerCatalogosUsuarios } from "../../../../features/administrador/services/CRUD/usuariosService.js";

function UsuarioDetalleContenido({ id, modo }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [roles, setRoles] = useState([]);
  const [areas, setAreas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([listarUsuarios(), obtenerCatalogosUsuarios()]).then(([usersData, catalogsData]) => {
      if (!active) return;
      setRoles(catalogsData.roles || []);
      setAreas(catalogsData.areas || []);
      setCategorias(catalogsData.categorias || []);
      if (id) {
        const found = (usersData.usuarios || []).find(item => String(item.id) === String(id));
        if (!found) {
          setNotFound(true);
        } else {
          setUsuario(found);
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
        <p className="text-lg font-bold text-[#1e222b]">Usuario no encontrado</p>
        <p className="mt-1 text-sm text-slate-500">Puede que ya haya sido eliminado o el enlace esté desactualizado.</p>
      </div> : <UsuarioFormulario
        usuario={usuario}
        roles={roles}
        areas={areas}
        categorias={categorias}
        modo={modo}
        initialAreaId={searchParams.get("area") || ""}
        onCancel={() => navigate(usuario ? `/usuarios/${usuario.id}` : "/usuarios")}
        onSaved={() => navigate("/usuarios")}
      />}
  </div>;
}

export default function UsuarioDetalle({ modo }) {
  const { id } = useParams();
  return <DashboardLayout>
    <UsuarioDetalleContenido key={id || "nuevo"} id={id} modo={modo} />
  </DashboardLayout>;
}
