import { useState } from "react";
import alerta from "../../../../shared/services/alertService.js";
import { actualizarArea, crearArea } from "../../services/CRUD/areasService.js";

export default function AreaFormulario({
  area,
  usuarios = [],
  modo,
  onCancel,
  onSaved,
}) {
  const readOnly = modo === "ver";
  const [nombre, setNombre] = useState(area?.nombre || "");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const submit = async event => {
    event.preventDefault();
    if (readOnly || !dirty) return;
    setSaving(true);

    try {
      const data = area
        ? await actualizarArea(area.id, nombre)
        : await crearArea(nombre);

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
            {readOnly ? "Detalle del área" : area ? "Editar área" : "Nueva área"}
          </h2>
          {!readOnly && <p className="mt-1 text-sm text-slate-500">
            {area
              ? "Actualiza el nombre del área seleccionada."
              : "Agrega una nueva área a la organización."}
          </p>}
        </div>

        {readOnly ? <div className="space-y-5 px-5 py-5">
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-400">Nombre del área</span>
              <p className="mt-1 text-base font-semibold text-[#1e222b]">{area?.nombre || "No registrado"}</p>
            </div>
            <section aria-labelledby="usuarios-area-title">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 id="usuarios-area-title" className="text-sm text-[#1e222b]">Usuarios</h3>
                </div>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#0076e3]">
                  {usuarios.length} {usuarios.length === 1 ? "usuario" : "usuarios"}
                </span>
              </div>

              {usuarios.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
                  <p className="text-sm font-semibold text-slate-600">Esta área todavía no tiene usuarios asignados.</p>
                </div> : <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {usuarios.map(usuario => <article key={usuario.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#1e222b]">{usuario.nombre} {usuario.apellido}</p>
                        <p className="truncate text-xs text-slate-500">{usuario.correo}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        {usuario.cargo && <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{usuario.cargo}</span>}
                        <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-[#0076e3]">{usuario.rol || "Sin rol"}</span>
                      </div>
                    </article>)}
                </div>}
            </section>
          </div> : <div className="px-5 py-4">
            <label className="text-sm font-semibold text-slate-700">
              Nombre del área
              <input
                className="field"
                placeholder="Ej. Tecnología"
                value={nombre}
                onChange={event => {
                  setNombre(event.target.value);
                  setDirty(true);
                }}
                autoFocus
                required
              />
            </label>
          </div>}

        {!readOnly && <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 px-5 py-3.5 sm:flex-row sm:justify-end">
          <button key="cancel-area-editing" type="button" onClick={onCancel} className="min-h-10 border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100">
            Cancelar
          </button>
          <button key="save-area" type="submit" disabled={saving || !dirty} className="min-h-10 bg-[#0076e3] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#005fbd] disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </footer>}
      </form>
    </div>
  );
}
