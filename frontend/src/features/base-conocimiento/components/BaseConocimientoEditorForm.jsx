import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import alerta from "../../../shared/services/alertService.js";
import { API_ORIGIN } from "../../../shared/services/httpClient.js";
import { eliminarArchivoProcedimiento, establecerPrincipal, subirArchivoProcedimiento } from "../services/archivosService.js";
import { actualizarProcedimiento, buscarTicketsReferencia, crearProcedimiento, publicarProcedimiento } from "../services/procedimientosService.js";
import { Badge } from "./BaseConocimientoPrimitives.jsx";
import { EMPTY_ARTICLE } from "./baseConocimientoConfig.js";
function authenticatedUserId() {
  return Number(JSON.parse(localStorage.getItem("usuario") || "null")?.id);
}
function fileUrl(file) {
  const filename = file.nombre || file.nombre_original || file.ruta?.split(/[\\/]/).pop() || "";
  return `${API_ORIGIN}/uploads/${encodeURIComponent(filename)}`;
}
function initialForm(article) {
  return Object.fromEntries(Object.keys(EMPTY_ARTICLE).map(key => [key, article[key] ?? EMPTY_ARTICLE[key]]));
}
function TicketReferenciaField({ value, ticket, onSelect, onClear }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!open) return undefined;
    const closeOutside = event => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const timeout = setTimeout(() => {
      const requestId = ++requestIdRef.current;
      buscarTicketsReferencia(query)
        .then(response => {
          if (requestIdRef.current === requestId) setResults(response.tickets || []);
        })
        .catch(() => {
          if (requestIdRef.current === requestId) setResults([]);
        });
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, open]);

  if (value && ticket) {
    return <div className="field relative flex items-center pr-9">
        <span className="truncate text-sm font-semibold text-slate-700">Ticket #{ticket.id} - {ticket.usuario}</span>
        <button type="button" onClick={onClear} aria-label="Quitar ticket de referencia" className="absolute inset-y-0 right-0 flex items-center px-3">
          <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        </button>
      </div>;
  }

  return <div ref={containerRef} className="relative">
      <input
        className="field"
        placeholder="Buscar por número o título…"
        value={query}
        onChange={event => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && results.length > 0 && <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded border border-slate-200 bg-white shadow-lg">
          {results.map(ticketOption => <button
              type="button"
              key={ticketOption.id}
              onClick={() => {
                onSelect(ticketOption);
                setQuery("");
                setOpen(false);
              }}
              className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              Ticket #{ticketOption.id} - {ticketOption.usuario} - {ticketOption.categoria} - {ticketOption.prioridad}
            </button>)}
        </div>}
    </div>;
}
export default function BaseConocimientoEditorForm({
  categories,
  initial = EMPTY_ARTICLE,
  initialTicketReferencia = null,
  existingFiles = [],
  editingId,
  onCancel,
  onSaved
}) {
  const isCreating = !editingId;
  const [form, setForm] = useState(() => initialForm(initial));
  const [ticketReferencia, setTicketReferencia] = useState(initialTicketReferencia);
  const [attachedFiles, setAttachedFiles] = useState(existingFiles);
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const articleIdRef = useRef(editingId || null);
  const debounceRef = useRef(null);
  const changeField = ({
    target
  }) => {
    setForm(currentForm => ({
      ...currentForm,
      [target.name]: target.value
    }));
  };
  const selectTicketReferencia = ticket => {
    setTicketReferencia(ticket);
    setForm(currentForm => ({
      ...currentForm,
      ticket_referencia_id: ticket.id,
      titulo: ticket.titulo || "",
      categoria_id: ticket.categoria_id || "",
      descripcion: ticket.descripcion || ""
    }));
  };
  const clearTicketReferencia = () => {
    setTicketReferencia(null);
    setForm(currentForm => ({
      ...currentForm,
      ticket_referencia_id: "",
      titulo: "",
      categoria_id: "",
      descripcion: ""
    }));
  };
  const camposBloqueadosPorTicket = Boolean(ticketReferencia);
  const handleSetPrimary = async fileId => {
    try {
      await establecerPrincipal(fileId);
      setAttachedFiles(current => current.map(file => ({
        ...file,
        es_principal: file.id === fileId
      })));
    } catch (error) {
      await alerta.fire({
        icon: "error",
        title: "No se pudo actualizar el archivo",
        text: error.response?.data?.message
      });
    }
  };
  const handleRemoveFile = async fileId => {
    const result = await alerta.fire({
      icon: "warning",
      title: "¿Eliminar este archivo?",
      text: "Esta acción no se puede deshacer.",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626"
    });
    if (!result.isConfirmed) return;
    try {
      await eliminarArchivoProcedimiento(fileId);
      setAttachedFiles(current => current.filter(file => file.id !== fileId));
    } catch (error) {
      await alerta.fire({
        icon: "error",
        title: "No se pudo eliminar el archivo",
        text: error.response?.data?.message
      });
    }
  };
  const persistDraft = useCallback(async currentForm => {
    const titulo = String(currentForm.titulo || "").trim();
    const descripcion = String(currentForm.descripcion || "").trim();
    if (!titulo || !descripcion || !currentForm.categoria_id) return null;
    const userId = authenticatedUserId();
    if (!userId) return null;
    let articleId = articleIdRef.current;
    if (!articleId) {
      const response = await crearProcedimiento({
        titulo,
        descripcion,
        categoria_id: Number(currentForm.categoria_id),
        autor_id: userId
      });
      articleId = response.procedimiento.id;
      articleIdRef.current = articleId;
    }
    await actualizarProcedimiento(articleId, {
      ...currentForm,
      titulo,
      descripcion,
      solucion: String(currentForm.solucion || "").trim(),
      notas: String(currentForm.notas || "").trim(),
      categoria_id: Number(currentForm.categoria_id),
      ticket_referencia_id: currentForm.ticket_referencia_id || null
    });
    return articleId;
  }, []);
  useEffect(() => {
    if (!isCreating) return undefined;
    debounceRef.current = setTimeout(() => {
      persistDraft(form).catch(() => {});
    }, 1200);
    return () => clearTimeout(debounceRef.current);
  }, [form, isCreating, persistDraft]);
  const saveArticle = async () => {
    if (!form.titulo.trim() || !form.descripcion.trim() || !form.categoria_id) {
      await alerta.fire({
        icon: "warning",
        title: "Información incompleta",
        text: "Título, descripción y categoría son obligatorios."
      });
      return;
    }
    if (!authenticatedUserId()) {
      await alerta.fire({
        icon: "error",
        title: "Sesión no válida"
      });
      return;
    }
    clearTimeout(debounceRef.current);
    setSaving(true);
    try {
      let articleId;
      if (isCreating) {
        articleId = await persistDraft(form);
      } else {
        articleId = editingId;
        await actualizarProcedimiento(articleId, {
          ...form,
          titulo: String(form.titulo).trim(),
          descripcion: String(form.descripcion).trim(),
          solucion: String(form.solucion || "").trim(),
          notas: String(form.notas || "").trim(),
          categoria_id: Number(form.categoria_id),
          ticket_referencia_id: form.ticket_referencia_id || null
        });
      }
      for (const file of files) {
        const data = new FormData();
        data.append("archivo", file);
        data.append("procedimiento_id", articleId);
        await subirArchivoProcedimiento(data);
      }
      if (isCreating) {
        await publicarProcedimiento(articleId);
      }
      await onSaved(articleId);
    } catch (error) {
      await alerta.fire({
        icon: "error",
        title: "No se pudo guardar el artículo",
        text: error.response?.data?.message
      });
    } finally {
      setSaving(false);
    }
  };
  return <>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="md:col-span-2">
          Título
          <input
            name="titulo"
            value={form.titulo}
            onChange={changeField}
            className="field disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
            maxLength={180}
            disabled={camposBloqueadosPorTicket}
          />
        </label>

        <label>
          Categoría
          <select
            name="categoria_id"
            value={form.categoria_id}
            onChange={changeField}
            className="field disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
            disabled={camposBloqueadosPorTicket}
          >
            <option value="">Selecciona</option>
            {categories.map(category => <option key={category.id} value={category.id}>
                {category.nombre}
              </option>)}
          </select>
        </label>

        <div>
          <span className="block text-[12px] font-bold text-[#3f5062]">Referencia del ticket</span>
          <TicketReferenciaField
            value={form.ticket_referencia_id}
            ticket={ticketReferencia}
            onSelect={selectTicketReferencia}
            onClear={clearTicketReferencia}
          />
          <span className="mt-1.5 block text-xs font-normal text-slate-500">
            {camposBloqueadosPorTicket
              ? "Título, categoría y descripción se tomaron del ticket. Solo redacta la solución y las notas."
              : "Si referencias un ticket, el título, la categoría y la descripción se completan solos."}
          </span>
        </div>

        <label className="md:col-span-2">
          Descripción
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={changeField}
            rows={3}
            className="field disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
            disabled={camposBloqueadosPorTicket}
          />
        </label>

        <label className="md:col-span-2">
          Solución
          <textarea name="solucion" value={form.solucion || ""} onChange={changeField} rows={4} className="field" />
        </label>

        <label className="md:col-span-2">
          Notas
          <textarea name="notas" value={form.notas || ""} onChange={changeField} rows={3} className="field" />
        </label>
      </div>

      {!isCreating && <div className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">Archivos adjuntos</h3>
          {attachedFiles.length === 0
            ? <p className="mt-1.5 text-sm text-slate-400">No hay archivos adjuntos.</p>
            : <div className="mt-2 flex flex-wrap gap-2.5">
                {attachedFiles.map(file => <div key={file.id} className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 py-2 pl-3 pr-2.5">
                    <a href={fileUrl(file)} target="_blank" rel="noreferrer" className="max-w-[200px] truncate text-sm font-medium text-slate-700 hover:text-[#0076e3] hover:underline">
                      {file.nombre_original || file.nombre}
                    </a>
                    {file.es_principal
                      ? <Badge tone="blue">Principal</Badge>
                      : <button type="button" onClick={() => handleSetPrimary(file.id)} className="text-xs font-semibold text-slate-400 hover:text-[#0076e3]">
                          Marcar principal
                        </button>}
                    <button type="button" onClick={() => handleRemoveFile(file.id)} aria-label="Eliminar archivo" className="shrink-0">
                      <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                    </button>
                  </div>)}
              </div>}
        </div>}

      <label className="mt-5 block">
        {isCreating ? "Archivos" : "Agregar archivos"}
        <input type="file" multiple className="field" onChange={event => setFiles(Array.from(event.target.files || []))} />
      </label>

      {isCreating && <p className="mt-4 text-xs text-slate-400">
          Tu progreso se guarda como borrador automáticamente. Solo se publica al hacer clic en “Publicar”.
        </p>}

      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 font-semibold text-slate-500">
          Cancelar
        </button>
        <button type="button" disabled={saving} onClick={saveArticle} className="bg-blue-600 px-5 py-2 font-semibold text-white disabled:opacity-50">
          {saving ? "Guardando…" : isCreating ? "Publicar" : "Guardar cambios"}
        </button>
      </div>
    </>;
}
