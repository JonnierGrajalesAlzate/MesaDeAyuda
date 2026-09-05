import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import archivoIcon from "../../../assets/archivo.png";
import BaseConocimientoFolders from "../../../features/base-conocimiento/components/BaseConocimientoFolders.jsx";
import BaseConocimientoSidebar from "../../../features/base-conocimiento/components/BaseConocimientoSidebar.jsx";
import FilterDisclosure from "../../../shared/ui/Filters/FilterDisclosure.jsx";
import FilterDropdown from "../../../shared/ui/Filters/FilterDropdown.jsx";
import FilterSearchInput from "../../../shared/ui/Filters/FilterSearchInput.jsx";
import useRealtimeRefresh from "../../../shared/hooks/useRealtimeRefresh.js";
import DashboardLayoutTecnico from "../../layouts/DashboardLayoutTecnico.jsx";
import DashboardLayoutAdministrador from "../../layouts/DashboardLayoutAdministrador.jsx";
import { obtenerProcedimientos } from "../../../features/base-conocimiento/services/procedimientosService.js";
import { obtenerCategorias } from "../../../features/tickets/services/catalogosService.js";
const FOLDER_LABELS = {
  published: "Publicadas",
  drafts: "Borradores",
  archived: "Archivadas",
  trash: "Eliminadas"
};
function authenticatedUserId() {
  return Number(JSON.parse(localStorage.getItem("usuario") || "null")?.id);
}
function normalizeArticle(article) {
  return {
    ...article,
    categoria: article.categoria || "Sin categoría",
    resumen: article.descripcion || "Sin descripción disponible"
  };
}
function matchesFolder(article, folder, isOwn) {
  if (folder === "published") return article.estado === "PUBLICADO";
  if (folder === "drafts") return isOwn(article) && article.estado === "BORRADOR";
  if (folder === "archived") return isOwn(article) && article.estado === "ARCHIVADO";
  return true;
}
async function fetchKnowledgeBase() {
  return Promise.allSettled([obtenerProcedimientos(), obtenerCategorias(), obtenerProcedimientos({ papelera: true })]);
}
export default function BaseConocimiento({ layoutRole = "tecnico" }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentUserId = authenticatedUserId();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trashItems, setTrashItems] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState([]);
  const [folder, setFolder] = useState("published");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const basePath = layoutRole === "administrador" ? "/administrador/base-conocimiento" : "/baseConocimiento";
  const crearGuiaPath = `${basePath}/crear-guia`;
  const isOwn = useCallback(article => Number(article?.autor_id) === currentUserId, [currentUserId]);
  const applyResults = useCallback(([articlesResult, categoriesResult, trashResult]) => {
    if (articlesResult.status === "fulfilled") {
      const articles = articlesResult.value.procedimientos || [];
      setItems(articles.map(normalizeArticle));
      setError("");
    } else {
      setError("No se pudieron cargar los procedimientos.");
    }
    if (categoriesResult.status === "fulfilled") {
      const categoryList = Array.isArray(categoriesResult.value) ? categoriesResult.value : categoriesResult.value.categorias || [];
      setCategories(categoryList);
    }
    if (trashResult?.status === "fulfilled") {
      setTrashItems((trashResult.value.procedimientos || []).map(normalizeArticle));
    }
  }, []);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      applyResults(await fetchKnowledgeBase());
    } finally {
      setLoading(false);
    }
  }, [applyResults]);
  useEffect(() => {
    let active = true;
    fetchKnowledgeBase().then(results => {
      if (active) applyResults(results);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [applyResults]);
  useEffect(() => {
    const articleId = searchParams.get("articulo");
    if (articleId) navigate(`${basePath}/${articleId}`, { replace: true });
  }, [searchParams, navigate, basePath]);
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const source = folder === "trash" ? trashItems : items;
    return source.filter(article => {
      const matchesFolderState = matchesFolder(article, folder, isOwn);
      const matchesCategory = !category.length || category.includes(String(article.categoria_id));
      const searchableText = `${article.titulo} ${article.resumen} ${article.categoria}`.toLowerCase();
      const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery);
      return matchesFolderState && matchesCategory && matchesQuery;
    });
  }, [category, folder, isOwn, items, query, trashItems]);
  const counts = useMemo(() => ({
    published: items.filter(article => article.estado === "PUBLICADO").length,
    drafts: items.filter(article => isOwn(article) && article.estado === "BORRADOR").length,
    archived: items.filter(article => isOwn(article) && article.estado === "ARCHIVADO").length,
    trash: trashItems.length
  }), [isOwn, items, trashItems]);
  useRealtimeRefresh("base-conocimiento", load, 500);
  const DashboardLayout = layoutRole === "administrador"
    ? DashboardLayoutAdministrador
    : DashboardLayoutTecnico;

  return <DashboardLayout>
      <div className="bc-page flex flex-col gap-5 lg:h-[calc(100vh-60px)]">
        <header className="azure-page-header news-management-header">
          <div className="news-management-copy">
            <span className="news-management-eyebrow">Documentación interna</span>
            <p>Encuentra y mantiene procedimientos técnicos.</p>
          </div>

          <button
            type="button"
            onClick={() => navigate(crearGuiaPath)}
            aria-label="Crear nuevo artículo"
            title="Crear nuevo artículo"
            className="news-create-button"
          >
            <img src={archivoIcon} alt="" />
          </button>
        </header>

        <FilterDisclosure
          title="Consultar artículos"
          description="Busca procedimientos y limita los resultados por categoría."
        >
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px] md:items-center">
            <FilterSearchInput value={query} onChange={setQuery} label="Buscar artículos" placeholder="Buscar artículos..." />
            <FilterDropdown
              label="Categoría"
              value={category}
              onChange={setCategory}
              options={[
                { value: "", label: "Todas las categorías" },
                ...categories.map(categoryOption => ({
                  value: String(categoryOption.id),
                  label: categoryOption.nombre
                }))
              ]}
              multiple
            />
          </div>
        </FilterDisclosure>

        {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>}

        <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[224px_1fr]">
          <BaseConocimientoFolders
            folder={folder}
            counts={counts}
            onSelect={setFolder}
          />

          <section className="flex min-h-0 flex-1 flex-col overflow-hidden border bg-white shadow-sm">
            <BaseConocimientoSidebar
              articles={filtered}
              folderLabel={FOLDER_LABELS[folder]}
              loading={loading}
              selectedId={null}
              onOpen={id => navigate(`${basePath}/${id}`)}
            />
          </section>
        </div>
      </div>
    </DashboardLayout>;
}
