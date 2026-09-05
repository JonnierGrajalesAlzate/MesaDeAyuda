import { useState } from "react";
import alerta from "../../../../shared/services/alertService.js";
import { actualizarCategoria, crearCategoria } from "../../services/CRUD/categoriasService.js";
import SubcategoriasManager from "./SubcategoriasManager.jsx";

export default function CategoriaFormulario({
  categoria,
  modo,
  prioridades,
  onCancel,
  onSaved,
}) {
  const readOnly = modo === "ver";
  const [nombre, setNombre] = useState(categoria?.nombre || "");
  const [descripcion, setDescripcion] = useState(categoria?.descripcion || "");
  const [prioridadId, setPrioridadId] = useState(categoria?.prioridad_id ? String(categoria.prioridad_id) : "");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const prioridadActual = prioridades?.find(item => String(item.id) === String(categoria?.prioridad_id));

  const submit = async event => {
    event.preventDefault();
    if (readOnly || !dirty) return;
    setSaving(true);

    try {
      const data = categoria
        ? await actualizarCategoria(categoria.id, nombre, descripcion, prioridadId)
        : await crearCategoria(nombre, descripcion, prioridadId);

      await alerta.fire({
        icon: "success",
        title: data.message,
        timer: 1300,
        showConfirmButton: false,
      });
      onSaved();
    } catch (error) {
      alerta.fire({
        icon: "error",
        title: "No se pudo guardar",
        text: error.response?.data?.message,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="crud-detail-card">
      <form onSubmit={submit}>
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-xl font-bold text-[#1e222b]">
            {readOnly ? "Detalle de la categoría" : categoria ? "Editar categoría" : "Nueva categoría"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {readOnly
              ? "Consulta la información registrada y administra esta categoría."
              : categoria
              ? "Actualiza el nombre, la descripción y la prioridad de la categoría seleccionada."
              : "Agrega una nueva categoría de tickets."}
          </p>
        </div>

        {readOnly ? <div className="space-y-4 px-5 py-5">
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-400">Nombre</span>
              <p className="mt-1 text-base font-semibold text-[#1e222b]">{categoria?.nombre || "No registrado"}</p>
            </div>
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-400">Descripción</span>
              <p className="mt-1 text-sm text-slate-600">{categoria?.descripcion || "Sin descripción registrada."}</p>
            </div>
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-400">Prioridad de los tickets</span>
              <p className="mt-1 text-sm font-semibold" style={{ color: prioridadActual?.color || "#1e222b" }}>
                {prioridadActual?.nombre || "Sin prioridad configurada"}
              </p>
            </div>
          </div> : <div className="space-y-4 px-5 py-4">
            <label className="block text-sm font-semibold text-slate-700">
              Nombre de la categoría
              <input
                className="field"
                placeholder="Ej. Impresoras"
                value={nombre}
                onChange={event => {
                  setNombre(event.target.value);
                  setDirty(true);
                }}
                autoFocus
                required
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Descripción
              <textarea
                className="field min-h-24 resize-y"
                placeholder="Ej. Cambio de tóner, configuración y problemas de impresión."
                value={descripcion}
                onChange={event => {
                  setDescripcion(event.target.value);
                  setDirty(true);
                }}
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Prioridad de los tickets
              <select
                className="field"
                value={prioridadId}
                onChange={event => {
                  setPrioridadId(event.target.value);
                  setDirty(true);
                }}
                required
              >
                <option value="" disabled>Selecciona una prioridad</option>
                {(prioridades || []).map(prioridad => (
                  <option key={prioridad.id} value={prioridad.id}>{prioridad.nombre}</option>
                ))}
              </select>
              <span className="mt-1 block text-xs font-normal text-slate-400">
                Los tickets creados en esta categoría tomarán esta prioridad automáticamente.
              </span>
            </label>
          </div>}

        {categoria && <div className="border-t border-slate-200 px-5 py-4">
            <SubcategoriasManager categoriaId={categoria.id} prioridades={prioridades} readOnly={readOnly} />
          </div>}

        {!readOnly && <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 px-5 py-3.5 sm:flex-row sm:justify-end">
          <button key="cancel-categoria-editing" type="button" onClick={onCancel} className="min-h-10 border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100">
            Cancelar
          </button>
          <button key="save-categoria" type="submit" disabled={saving || !dirty} className="min-h-10 bg-[#0076e3] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#005fbd] disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </footer>}
      </form>
    </div>
  );
}
