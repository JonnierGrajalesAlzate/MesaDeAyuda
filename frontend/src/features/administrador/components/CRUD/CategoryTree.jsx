import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import CrudActionsMenu from "./CrudActionsMenu.jsx";
import { listarSubcategorias } from "../../services/CRUD/subcategoriasService.js";

function ToggleIcon({ open }) {
  return (
    <svg viewBox="0 0 10 10" aria-hidden="true">
      <path d="M1 5h8" />
      {!open && <path d="M5 1v8" />}
    </svg>
  );
}

// Nodo recursivo del árbol: una categoría puede tener subcategorías como hijas,
// y este mismo componente vuelve a invocarse a sí mismo para renderizar cada una
// (caso base: un nodo sin hijos, como una subcategoría, simplemente no vuelve a expandirse).
function CategoryNode({ categoria, onViewCategoria, onEditCategoria, onDeleteCategoria }) {
  const esCategoria = categoria.tipo === "categoria";
  const [open, setOpen] = useState(false);
  const [hijos, setHijos] = useState(null);
  const [cargando, setCargando] = useState(false);

  const toggle = () => {
    if (!esCategoria) return;
    const next = !open;
    setOpen(next);
    if (next && hijos === null) {
      setCargando(true);
      listarSubcategorias(categoria.id)
        .then(data => setHijos((data.subcategorias || []).map(sub => ({
          id: sub.id,
          tipo: "subcategoria",
          nombre: sub.descripcion,
          descripcion: ""
        }))))
        .catch(() => setHijos([]))
        .finally(() => setCargando(false));
    }
  };

  return (
    <li>
      <div className="org-tree-node">
        {esCategoria && (
          <button type="button" className="org-tree-toggle" onClick={toggle} aria-expanded={open} aria-label={open ? `Contraer ${categoria.nombre}` : `Expandir ${categoria.nombre}`}>
            <ToggleIcon open={open} />
          </button>
        )}
        <div className="org-tree-user-row">
          <div className="min-w-0">
            <p className="org-tree-user-name" title={categoria.nombre}>{categoria.nombre}</p>
            {categoria.descripcion && <p className="org-tree-user-meta" title={categoria.descripcion}>{categoria.descripcion}</p>}
          </div>
        </div>
        {esCategoria && (
          <div className="org-tree-actions">
            <CrudActionsMenu
              itemLabel={categoria.nombre}
              editLabel="Editar categoría"
              deleteLabel="Eliminar categoría"
              onView={() => onViewCategoria(categoria)}
              onEdit={() => onEditCategoria(categoria)}
              onDelete={() => onDeleteCategoria(categoria)}
            />
          </div>
        )}
      </div>

      {esCategoria && open && <ul className="org-tree-children">
        {cargando && <li><div className="org-tree-empty-branch">Cargando subcategorías…</div></li>}
        {!cargando && hijos?.length === 0 && <li><div className="org-tree-empty-branch">Sin subcategorías registradas.</div></li>}
        {!cargando && hijos?.map(hijo => (
          <CategoryNode
            key={`${hijo.tipo}-${hijo.id}`}
            categoria={hijo}
            onViewCategoria={onViewCategoria}
            onEditCategoria={onEditCategoria}
            onDeleteCategoria={onDeleteCategoria}
          />
        ))}
      </ul>}
    </li>
  );
}

export default function CategoryTree({
  categorias,
  query,
  onCreateCategoria,
  onViewCategoria,
  onEditCategoria,
  onDeleteCategoria,
  onEmptyChange,
}) {
  const [open, setOpen] = useState(false);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleCategorias = normalizedQuery
    ? categorias.filter(categoria => `${categoria.nombre} ${categoria.descripcion || ""}`.toLowerCase().includes(normalizedQuery))
    : categorias;
  const isOpen = normalizedQuery ? true : open;
  const isEmpty = Boolean(normalizedQuery) && visibleCategorias.length === 0;

  useEffect(() => {
    onEmptyChange?.(isEmpty);
  }, [isEmpty, onEmptyChange]);

  if (isEmpty) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-none border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
    <div className="org-tree">
      <ul className="org-tree-list">
        <li>
          <div className="org-tree-node">
            <button type="button" className="org-tree-toggle" onClick={() => setOpen(value => !value)} aria-expanded={isOpen} aria-label={isOpen ? "Contraer categorías" : "Expandir categorías"}>
              <ToggleIcon open={isOpen} />
            </button>
            <span className="org-tree-root-label"><span>Categorías LG</span></span>
            <div className="org-tree-actions">
              <button type="button" className="org-tree-add-user" onClick={onCreateCategoria} aria-label="Crear categoría" title="Crear categoría">
                <Plus className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
              </button>
            </div>
          </div>

          {isOpen && <ul className="org-tree-children">
            {visibleCategorias.map(categoria => (
              <CategoryNode
                key={categoria.id}
                categoria={{ ...categoria, tipo: "categoria" }}
                onViewCategoria={onViewCategoria}
                onEditCategoria={onEditCategoria}
                onDeleteCategoria={onDeleteCategoria}
              />
            ))}
            {visibleCategorias.length === 0 && <li>
              <div className="org-tree-empty-branch">
                {normalizedQuery ? "Sin coincidencias en categorías." : "No hay categorías registradas."}
              </div>
            </li>}
          </ul>}
        </li>
      </ul>
    </div>
    </div>
  );
}
