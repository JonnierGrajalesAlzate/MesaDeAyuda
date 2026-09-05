import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import alerta from "../../../../shared/services/alertService.js";
import DashboardLayout from "../../../layouts/DashboardLayoutAdministrador.jsx";
import OrgTree from "../../../../features/administrador/components/CRUD/OrgTree.jsx";
import CategoryTree from "../../../../features/administrador/components/CRUD/CategoryTree.jsx";
import FilterDisclosure from "../../../../shared/ui/Filters/FilterDisclosure.jsx";
import FilterSearchInput from "../../../../shared/ui/Filters/FilterSearchInput.jsx";
import TransferTicketsModal from "../../../../features/administrador/components/CRUD/TransferTicketsModal.jsx";
import useUsuarioDelete from "../../../../features/administrador/hooks/useUsuarioDelete.js";
import { confirmAndDelete } from "../../../../features/administrador/utils/crudConfirm.js";
import { listarUsuarios, obtenerCatalogosUsuarios } from "../../../../features/administrador/services/CRUD/usuariosService.js";
import { eliminarArea } from "../../../../features/administrador/services/CRUD/areasService.js";
import { eliminarCategoria } from "../../../../features/administrador/services/CRUD/categoriasService.js";
import { obtenerCategorias } from "../../../../features/tickets/services/catalogosService.js";
import useRealtimeRefresh from "../../../../shared/hooks/useRealtimeRefresh.js";
import logo2 from "../../../../assets/logo2.png";
import sinBusquedaIcon from "../../../../assets/SinBusqueda.png";
export default function Usuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [areas, setAreas] = useState([]);
  const [categoriasArbol, setCategoriasArbol] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [orgTreeEmpty, setOrgTreeEmpty] = useState(false);
  const [categoryTreeEmpty, setCategoryTreeEmpty] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [usersData, catalogsData, categoriasData] = await Promise.all([listarUsuarios(), obtenerCatalogosUsuarios(), obtenerCategorias()]);
      setUsuarios(usersData.usuarios || []);
      setAreas(catalogsData.areas || []);
      setCategoriasArbol(categoriasData || []);
    } catch {
      alerta.fire({
        icon: "error",
        title: "No se pudieron cargar los usuarios"
      });
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    let active = true;
    Promise.all([listarUsuarios(), obtenerCatalogosUsuarios(), obtenerCategorias()]).then(([usersData, catalogsData, categoriasData]) => {
      if (!active) return;
      setUsuarios(usersData.usuarios || []);
      setAreas(catalogsData.areas || []);
      setCategoriasArbol(categoriasData || []);
    }).catch(() => {
      if (active) alerta.fire({
        icon: "error",
        title: "No se pudieron cargar los usuarios"
      });
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);
  useRealtimeRefresh(["usuarios", "areas", "categorias"], load);

  const { remove, deleteTransfer, transferSaving, confirmDeleteTransfer, closeTransfer } = useUsuarioDelete(load);
  const removeArea = area => confirmAndDelete({
    item: area,
    title: "¿Eliminar área?",
    deleteFn: eliminarArea,
    onDeleted: load
  });
  const removeCategoria = categoria => confirmAndDelete({
    item: categoria,
    title: "¿Eliminar categoría?",
    deleteFn: eliminarCategoria,
    onDeleted: load
  });

  return <DashboardLayout>
            <div className="usuarios-page space-y-5">
                <div className="create-ticket-hero">
                    <img src={logo2} alt="" className="create-ticket-hero-logo" />
                    <h1 className="create-ticket-hero-title">Administración</h1>
                    <p className="create-ticket-hero-subtitle">Administra el CRUD de Áreas, Usuarios y categorias</p>
                </div>

                <FilterDisclosure
                  description="Consulta áreas, usuarios y categorías en un solo árbol, y gestiona todo desde aquí."
                  onClose={() => setQuery("")}
                >
                    <FilterSearchInput value={query} onChange={setQuery} label="Buscar usuario, área o categoría" placeholder="Buscar usuario, área o categoría..." className="max-w-xl" />
                </FilterDisclosure>

                {loading ? <p className="p-8 text-center text-slate-500">Cargando usuarios…</p> : <OrgTree
                          areas={areas}
                          usuarios={usuarios}
                          query={query}
                          onCreateArea={() => navigate("/usuarios/areas/nueva")}
                          onCreateUserInArea={area => navigate(`/usuarios/nuevo?area=${area.id}`)}
                          onViewArea={area => navigate(`/usuarios/areas/${area.id}`)}
                          onEditArea={area => navigate(`/usuarios/areas/${area.id}/editar`)}
                          onDeleteArea={removeArea}
                          onViewUser={user => navigate(`/usuarios/${user.id}`)}
                          onEditUser={user => navigate(`/usuarios/${user.id}/editar`)}
                          onDeleteUser={remove}
                          onEmptyChange={setOrgTreeEmpty}
                        />}

                {!loading && <CategoryTree
                          categorias={categoriasArbol}
                          query={query}
                          onCreateCategoria={() => navigate("/usuarios/categorias/nueva")}
                          onViewCategoria={categoria => navigate(`/usuarios/categorias/${categoria.id}`)}
                          onEditCategoria={categoria => navigate(`/usuarios/categorias/${categoria.id}/editar`)}
                          onDeleteCategoria={removeCategoria}
                          onEmptyChange={setCategoryTreeEmpty}
                        />}

                {!loading && query.trim() && orgTreeEmpty && categoryTreeEmpty && <div className="flex flex-col items-center gap-3 py-14 text-center">
                        <img src={sinBusquedaIcon} alt="" aria-hidden="true" className="h-24 w-24 object-contain" />
                        <h2 className="text-lg font-bold text-[#1e222b]">No encontramos coincidencias</h2>
                        <p className="max-w-sm text-sm text-slate-500">Prueba con otro nombre, área o categoría, o revisa que esté bien escrito.</p>
                    </div>}
            </div>
            <TransferTicketsModal
              key={`eliminar-${deleteTransfer?.usuario?.id || "usuario"}`}
              usuario={deleteTransfer?.usuario}
              plan={deleteTransfer?.plan}
              saving={transferSaving}
              onClose={closeTransfer}
              onConfirm={confirmDeleteTransfer}
            />
        </DashboardLayout>;
}
