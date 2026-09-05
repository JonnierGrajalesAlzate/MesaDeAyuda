import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import CrudActionsMenu from "./CrudActionsMenu.jsx";

const STATUS_DOT = {
  "En línea": "bg-emerald-500",
  "Fuera de línea": "bg-slate-400",
  Desactivado: "bg-red-500",
};

function matchesUser(user, normalizedQuery) {
  return `${user.nombre} ${user.apellido} ${user.correo} ${user.rol} ${user.area} ${user.estado} ${user.presencia}`
    .toLowerCase()
    .includes(normalizedQuery);
}

function ToggleIcon({ open }) {
  return (
    <svg viewBox="0 0 10 10" aria-hidden="true">
      <path d="M1 5h8" />
      {!open && <path d="M5 1v8" />}
    </svg>
  );
}

function ExpandToggle({ open, onClick, label }) {
  return (
    <button type="button" className="org-tree-toggle" onClick={onClick} aria-expanded={open} aria-label={label}>
      <ToggleIcon open={open} />
    </button>
  );
}

function UserLeaf({ usuario, onView, onEdit, onDelete }) {
  return (
    <li>
      <div className="org-tree-node">
        <div className="org-tree-user-row">
          <span className={`org-tree-status-dot ${STATUS_DOT[usuario.presencia] || STATUS_DOT["Fuera de línea"]}`} aria-hidden="true" />
          <div className="min-w-0">
            <p className="org-tree-user-name" title={`${usuario.nombre} ${usuario.apellido}`}>{usuario.nombre} {usuario.apellido}</p>
            <p className="org-tree-user-meta" title={usuario.cargo}>{usuario.cargo || "Sin cargo asignado"}</p>
          </div>
        </div>
        <div className="org-tree-actions">
          <CrudActionsMenu
            itemLabel={`${usuario.nombre} ${usuario.apellido}`}
            editLabel="Editar usuario"
            deleteLabel="Eliminar usuario"
            onView={() => onView(usuario)}
            onEdit={() => onEdit(usuario)}
            onDelete={() => onDelete(usuario)}
          />
        </div>
      </div>
    </li>
  );
}

export default function OrgTree({
  areas,
  usuarios,
  query,
  onCreateArea,
  onCreateUserInArea,
  onViewArea,
  onEditArea,
  onDeleteArea,
  onViewUser,
  onEditUser,
  onDeleteUser,
  onEmptyChange,
}) {
  const [rootExpanded, setRootExpanded] = useState(false);
  const [collapsedAreas, setCollapsedAreas] = useState(() => new Set());

  const toggleArea = id => setCollapsedAreas(current => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const normalizedQuery = query.trim().toLowerCase();

  const usersByAreaId = useMemo(() => {
    const map = new Map();
    usuarios.forEach(usuario => {
      const key = usuario.area_id ?? "sin-area";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(usuario);
    });
    return map;
  }, [usuarios]);

  const areaBranches = useMemo(() => areas.map(area => {
    const allUsers = usersByAreaId.get(area.id) || [];
    const areaNameMatches = normalizedQuery && area.nombre.toLowerCase().includes(normalizedQuery);
    const visibleUsers = !normalizedQuery || areaNameMatches
      ? allUsers
      : allUsers.filter(usuario => matchesUser(usuario, normalizedQuery));
    return { area, visibleUsers };
  }), [areas, usersByAreaId, normalizedQuery]);

  const visibleAreaBranches = normalizedQuery
    ? areaBranches.filter(branch => branch.visibleUsers.length > 0 || branch.area.nombre.toLowerCase().includes(normalizedQuery))
    : areaBranches;

  const sinAreaUsers = usersByAreaId.get("sin-area") || [];
  const visibleSinAreaUsers = normalizedQuery
    ? sinAreaUsers.filter(usuario => matchesUser(usuario, normalizedQuery))
    : sinAreaUsers;

  const isEmpty = Boolean(normalizedQuery) && visibleAreaBranches.length === 0 && visibleSinAreaUsers.length === 0;

  useEffect(() => {
    onEmptyChange?.(isEmpty);
  }, [isEmpty, onEmptyChange]);

  if (isEmpty) {
    return null;
  }

  const isRootOpen = normalizedQuery ? true : rootExpanded;

  return (
    <div className="overflow-hidden rounded-none border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
    <div className="org-tree">
      <ul className="org-tree-list">
        <li>
          <div className="org-tree-node">
            <ExpandToggle open={isRootOpen} onClick={() => setRootExpanded(value => !value)} label={isRootOpen ? "Contraer organización" : "Expandir organización"} />
            <span className="org-tree-root-label"><span>Soporte LG</span></span>
            <div className="org-tree-actions">
              <button type="button" className="org-tree-add-user" onClick={onCreateArea} aria-label="Crear área" title="Crear área">
                <Plus className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
              </button>
            </div>
          </div>

          {isRootOpen && <ul className="org-tree-children">
            {visibleAreaBranches.map(({ area, visibleUsers }) => {
              const open = normalizedQuery ? true : !collapsedAreas.has(area.id);
              return (
                <li key={area.id}>
                  <div className="org-tree-node">
                    <ExpandToggle open={open} onClick={() => toggleArea(area.id)} label={`${open ? "Contraer" : "Expandir"} ${area.nombre}`} />
                    <div className="org-tree-area-row" onClick={() => toggleArea(area.id)}>
                      <span className="org-tree-area-name" title={area.nombre}>{area.nombre}</span>
                    </div>
                    <div className="org-tree-actions" onClick={event => event.stopPropagation()}>
                      <button type="button" className="org-tree-add-user" onClick={() => onCreateUserInArea(area)} aria-label={`Crear usuario en ${area.nombre}`} title="Crear usuario en esta área">
                        <Plus className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
                      </button>
                      <CrudActionsMenu
                        itemLabel={area.nombre}
                        editLabel="Editar área"
                        deleteLabel="Eliminar área"
                        onView={() => onViewArea(area)}
                        onEdit={() => onEditArea(area)}
                        onDelete={() => onDeleteArea(area)}
                      />
                    </div>
                  </div>

                  {open && <ul className="org-tree-children">
                    {visibleUsers.map(usuario => (
                      <UserLeaf key={usuario.id} usuario={usuario} onView={onViewUser} onEdit={onEditUser} onDelete={onDeleteUser} />
                    ))}
                    {visibleUsers.length === 0 && <li>
                      <div className={normalizedQuery ? "org-tree-empty-branch" : "org-tree-empty-branch-plain"}>
                        {normalizedQuery ? "Sin coincidencias en esta área." : "No cuenta con usuarios"}
                      </div>
                    </li>}
                  </ul>}
                </li>
              );
            })}

            {visibleAreaBranches.length === 0 && <li>
              <div className="org-tree-empty-branch">No se encontraron áreas.</div>
            </li>}

            {visibleSinAreaUsers.length > 0 && <li>
              <div className="org-tree-node">
                <span className="org-tree-toggle" aria-hidden="true"><ToggleIcon open /></span>
                <div className="org-tree-area-row">
                  <span className="org-tree-area-name">Sin área</span>
                </div>
              </div>
              <ul className="org-tree-children">
                {visibleSinAreaUsers.map(usuario => (
                  <UserLeaf key={usuario.id} usuario={usuario} onView={onViewUser} onEdit={onEditUser} onDelete={onDeleteUser} />
                ))}
              </ul>
            </li>}
          </ul>}
        </li>
      </ul>
    </div>
    </div>
  );
}
