import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import CrudActionsMenu from "./CrudActionsMenu.jsx";

function ToggleIcon({ open }) {
  return (
    <svg viewBox="0 0 10 10" aria-hidden="true">
      <path d="M1 5h8" />
      {!open && <path d="M5 1v8" />}
    </svg>
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
              <li key={categoria.id}>
                <div className="org-tree-node">
                  <div className="org-tree-user-row">
                    <div className="min-w-0">
                      <p className="org-tree-user-name" title={categoria.nombre}>{categoria.nombre}</p>
                      <p className="org-tree-user-meta" title={categoria.descripcion}>{categoria.descripcion}</p>
                    </div>
                  </div>
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
                </div>
              </li>
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
