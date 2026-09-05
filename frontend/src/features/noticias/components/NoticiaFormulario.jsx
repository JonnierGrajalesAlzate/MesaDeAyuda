import { useState } from "react";
import alerta from "../../../shared/services/alertService.js";
import { actualizarNoticia, crearNoticia } from "../services/noticiasService.js";
import EstadoNoticiaBadge from "./TablaNoticias/EstadoNoticiaBadge.jsx";
import EtiquetaBadge from "./TablaNoticias/EtiquetaBadge.jsx";
import { alertaErrorGuardar, alertaNoticiaActualizada, alertaNoticiaCreada } from "./utils/noticiasAlerts.js";

const EMPTY_NOTICIA = {
  titulo: "",
  descripcion: "",
  etiqueta_id: "",
  estado_id: "",
};

function formatFecha(value) {
  if (!value) return "No registrada";

  return new Date(value).toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function DetailValue({ label, value, wide = false }) {
  return <div className={`min-w-0 py-2 ${wide ? "sm:col-span-2" : ""}`}>
    <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</span>
    <p className="mt-1 whitespace-pre-wrap break-words text-sm font-semibold text-[#1e222b]">{value || "No registrado"}</p>
  </div>;
}

export default function NoticiaFormulario({
  noticia,
  etiquetas,
  estados,
  modo,
  usuarioId,
  onCancel,
  onSaved,
}) {
  const readOnly = modo === "ver";
  const [form, setForm] = useState({
    ...EMPTY_NOTICIA,
    titulo: noticia?.titulo || "",
    descripcion: noticia?.descripcion || "",
    etiqueta_id: noticia?.etiqueta_id ? Number(noticia.etiqueta_id) : "",
    estado_id: noticia?.estado_id ? Number(noticia.estado_id) : "",
  });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const changeField = ({ target }) => {
    setDirty(true);
    setForm(currentForm => ({
      ...currentForm,
      [target.name]: target.value,
    }));
  };

  const submit = async event => {
    event.preventDefault();
    if (readOnly || !dirty) return;
    if (!form.titulo.trim()) {
      await alerta.fire({ icon: "warning", title: "Título requerido", text: "Ingrese el título de la noticia." });
      return;
    }
    if (!form.etiqueta_id) {
      await alerta.fire({ icon: "warning", title: "Etiqueta requerida", text: "Seleccione una etiqueta." });
      return;
    }
    if (!form.descripcion.trim()) {
      await alerta.fire({ icon: "warning", title: "Observaciones requeridas", text: "Ingrese las observaciones." });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        titulo: form.titulo,
        descripcion: form.descripcion,
        etiqueta_id: Number(form.etiqueta_id),
        estado_id: form.estado_id ? Number(form.estado_id) : undefined,
      };

      if (noticia) {
        await actualizarNoticia(noticia.id, payload);
        await alertaNoticiaActualizada();
      } else {
        await crearNoticia({ ...payload, usuario_id: usuarioId });
        await alertaNoticiaCreada();
      }
      onSaved();
    } catch (error) {
      console.error("No se pudo guardar la noticia", error);
      await alertaErrorGuardar();
    } finally {
      setSaving(false);
    }
  };

  return <div className="crud-detail-card">
    <form onSubmit={submit}>
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-xl font-bold text-[#1e222b]">
          {readOnly ? "Detalle de la noticia" : noticia ? "Editar noticia" : "Nueva noticia"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {readOnly
            ? "Consulta la información publicada de esta noticia."
            : noticia
              ? "Actualiza la información de la noticia."
              : "Completa la información para publicar una noticia."}
        </p>
      </div>

      {readOnly ? <div className="px-5 py-4">
          <div className="grid gap-x-8 gap-y-1 border-b border-slate-200 pb-4 sm:grid-cols-2">
            <DetailValue label="Título" value={noticia?.titulo} wide />
            <div className="min-w-0 py-2">
              <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-400">Etiqueta</span>
              <div className="mt-1.5">
                <EtiquetaBadge etiqueta={noticia?.etiqueta || "Sin etiqueta"} color={noticia?.color} centrada={false} />
              </div>
            </div>
            <div className="min-w-0 py-2">
              <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-400">Estado</span>
              <div className="mt-1.5">
                <EstadoNoticiaBadge estado={noticia?.estado || "Publicada"} color={noticia?.estado_color} />
              </div>
            </div>
            <DetailValue label="Autor" value={`${noticia?.nombre || ""} ${noticia?.apellido || ""}`.trim()} />
            <DetailValue label="Fecha de creación" value={formatFecha(noticia?.fecha_creacion)} />
            {noticia?.fecha_modificacion && <DetailValue label="Última modificación" value={formatFecha(noticia.fecha_modificacion)} />}
            {noticia?.modificado_por_nombre && <DetailValue label="Modificado por" value={`${noticia.modificado_por_nombre} ${noticia.modificado_por_apellido || ""}`.trim()} />}
            <DetailValue label="Contenido de la noticia" value={noticia?.descripcion} wide />
          </div>
        </div> : <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
            Título
            <input
              required
              name="titulo"
              value={form.titulo}
              onChange={changeField}
              placeholder="Ej. Outlook presenta intermitencias"
              className="field"
              type="text"
            />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Etiqueta
            <select required name="etiqueta_id" value={form.etiqueta_id} onChange={changeField} className="field">
              <option value="">Seleccione una etiqueta...</option>
              {etiquetas.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
            </select>
          </label>

          {noticia && <label className="text-sm font-semibold text-slate-700">
            Estado
            <select name="estado_id" value={form.estado_id} onChange={changeField} className="field">
              {estados.map(estado => <option key={estado.id} value={estado.id}>{estado.nombre}</option>)}
            </select>
          </label>}

          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
            Observaciones
            <textarea
              required
              rows={4}
              name="descripcion"
              value={form.descripcion}
              onChange={changeField}
              placeholder="Escribe aquí el contenido de la noticia..."
              className="field min-h-28 resize-y"
            />
          </label>
        </div>}

      {!readOnly && <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 px-5 py-3.5 sm:flex-row sm:justify-end">
        <button key="cancel-editing" type="button" onClick={onCancel} className="min-h-10 border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100">
          Cancelar
        </button>
        <button key="save-noticia" type="submit" disabled={saving || !dirty} className="min-h-10 bg-[#0076e3] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#005fbd] disabled:cursor-not-allowed disabled:opacity-50">
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </footer>}
    </form>
  </div>;
}
