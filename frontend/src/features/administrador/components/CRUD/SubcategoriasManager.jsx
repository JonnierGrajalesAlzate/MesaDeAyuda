import { useEffect, useState } from "react";
import { Pencil, X } from "lucide-react";
import alerta from "../../../../shared/services/alertService.js";
import { actualizarSubcategoria, crearSubcategoria, eliminarSubcategoria, listarSubcategorias } from "../../services/CRUD/subcategoriasService.js";

function SubcategoriaForm({ descripcion, setDescripcion, prioridadId, setPrioridadId, prioridades, saving, onSubmit, onCancel }) {
  return (
    <div className="flex flex-col gap-2 rounded border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center">
      <input
        className="field flex-1"
        placeholder="Ej. Restablecer contraseña"
        value={descripcion}
        onChange={event => setDescripcion(event.target.value)}
        onKeyDown={event => {
          if (event.key === "Enter") onSubmit(event);
        }}
        maxLength={300}
        autoFocus
      />
      <select className="field sm:basis-40 sm:grow-0 sm:shrink-0" value={prioridadId} onChange={event => setPrioridadId(event.target.value)}>
        <option value="" disabled>Prioridad</option>
        {(prioridades || []).map(prioridad => <option key={prioridad.id} value={prioridad.id}>{prioridad.nombre}</option>)}
      </select>
      <div className="flex gap-2">
        <button type="button" onClick={onSubmit} disabled={saving} className="min-h-9 bg-[#0076e3] px-3 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
          Guardar
        </button>
        <button type="button" onClick={onCancel} className="min-h-9 border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-600">
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default function SubcategoriasManager({ categoriaId, prioridades, readOnly }) {
  const [subcategorias, setSubcategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [descripcion, setDescripcion] = useState("");
  const [prioridadId, setPrioridadId] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchSubcategorias = () => listarSubcategorias(categoriaId)
    .then(data => setSubcategorias(data.subcategorias || []))
    .catch(() => {});

  useEffect(() => {
    let active = true;
    fetchSubcategorias().finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriaId]);

  const startCreate = () => {
    setEditingId("nueva");
    setDescripcion("");
    setPrioridadId("");
  };

  const startEdit = subcategoria => {
    setEditingId(subcategoria.id);
    setDescripcion(subcategoria.descripcion);
    setPrioridadId(String(subcategoria.prioridad_id));
  };

  const cancelEdit = () => setEditingId(null);

  const submit = async event => {
    event.preventDefault();
    if (!descripcion.trim() || !prioridadId) return;
    setSaving(true);
    try {
      if (editingId === "nueva") {
        await crearSubcategoria(categoriaId, descripcion.trim(), prioridadId);
      } else {
        await actualizarSubcategoria(editingId, descripcion.trim(), prioridadId);
      }
      setEditingId(null);
      fetchSubcategorias();
    } catch (error) {
      await alerta.fire({
        icon: "error",
        title: "No se pudo guardar la subcategoría",
        text: error.response?.data?.message
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async subcategoria => {
    const result = await alerta.fire({
      icon: "warning",
      title: "¿Eliminar esta subcategoría?",
      text: "Esta acción no se puede deshacer.",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626"
    });
    if (!result.isConfirmed) return;
    try {
      await eliminarSubcategoria(subcategoria.id);
      fetchSubcategorias();
    } catch (error) {
      await alerta.fire({
        icon: "error",
        title: "No se pudo eliminar la subcategoría",
        text: error.response?.data?.message
      });
    }
  };

  const prioridadDe = id => prioridades?.find(item => String(item.id) === String(id));

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-400">Subcategorías</span>
        {!readOnly && editingId === null && (
          <button type="button" onClick={startCreate} className="text-xs font-semibold text-[#0076e3] hover:underline">
            + Agregar subcategoría
          </button>
        )}
      </div>
      {loading ? <p className="mt-3 text-sm text-slate-400">Cargando…</p> : <div className="mt-3 space-y-2">
        {subcategorias.map(subcategoria => {
          const prioridad = prioridadDe(subcategoria.prioridad_id);
          if (editingId === subcategoria.id) {
            return <SubcategoriaForm
              key={subcategoria.id}
              descripcion={descripcion}
              setDescripcion={setDescripcion}
              prioridadId={prioridadId}
              setPrioridadId={setPrioridadId}
              prioridades={prioridades}
              saving={saving}
              onSubmit={submit}
              onCancel={cancelEdit}
            />;
          }
          return (
            <div key={subcategoria.id} className="flex items-center justify-between gap-3 rounded border border-slate-200 bg-white px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-700">{subcategoria.descripcion}</p>
                <span className="mt-0.5 inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: prioridad?.color || "#667587" }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: prioridad?.color || "#94a3b8" }} aria-hidden="true" />
                  {prioridad?.nombre || "Sin prioridad configurada"}
                </span>
              </div>
              {!readOnly && <div className="flex shrink-0 items-center gap-1">
                <button type="button" onClick={() => startEdit(subcategoria)} aria-label="Editar subcategoría" className="p-1.5">
                  <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                </button>
                <button type="button" onClick={() => remove(subcategoria)} aria-label="Eliminar subcategoría" className="p-1.5">
                  <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                </button>
              </div>}
            </div>
          );
        })}

        {editingId === "nueva" && <SubcategoriaForm
          descripcion={descripcion}
          setDescripcion={setDescripcion}
          prioridadId={prioridadId}
          setPrioridadId={setPrioridadId}
          prioridades={prioridades}
          saving={saving}
          onSubmit={submit}
          onCancel={cancelEdit}
        />}

        {subcategorias.length === 0 && editingId !== "nueva" && <p className="text-sm text-slate-400">No hay subcategorías registradas.</p>}
      </div>}
    </div>
  );
}
