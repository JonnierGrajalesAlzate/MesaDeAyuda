import { API_ORIGIN } from "../../../shared/services/httpClient.js";
import BaseConocimientoDetailMenu from "./BaseConocimientoDetailMenu.jsx";
import { Badge } from "./BaseConocimientoPrimitives.jsx";
import { getStatusTone } from "./baseConocimientoConfig.js";
function fileUrl(file) {
  const filename = file.nombre || file.nombre_original || file.ruta?.split(/[\\/]/).pop() || "";
  return `${API_ORIGIN}/uploads/${encodeURIComponent(filename)}`;
}
function initials(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return parts.slice(0, 2).map(part => part.charAt(0).toUpperCase()).join("");
}
function formatFecha(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}
function BackButton({ onBack }) {
  return <button type="button" onClick={onBack} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-[#0076e3]">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m15 18-6-6 6-6" />
      </svg>
      Regresar
    </button>;
}
function PaperclipIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-current text-slate-400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05 12.25 20.24a5 5 0 0 1-7.07-7.07L14.36 3.9a3.5 3.5 0 0 1 4.95 4.95L10.5 17.66a2 2 0 0 1-2.83-2.83l8.12-8.12" />
    </svg>;
}
function FieldBlock({ title, value, first = false }) {
  return <div className={first ? "" : "border-t border-slate-100 pt-5"}>
      <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">{title}</h3>
      <p className="mt-1.5 whitespace-pre-line leading-7 text-slate-700">{value}</p>
    </div>;
}
function TicketReferenciaCard({ ticket }) {
  if (!ticket) return null;
  const fecha = formatFecha(ticket.fecha_creacion);
  return <section className="border border-[#bcdcff] bg-[#eaf4ff] p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-[#0076e3]">Caso de origen</p>
      <h3 className="mt-1 text-lg font-bold text-slate-800">Ticket #{ticket.id} · {ticket.titulo}</h3>
      <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{ticket.descripcion}</p>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
        <span><strong className="text-slate-700">Solicitante:</strong> {ticket.usuario}</span>
        <span><strong className="text-slate-700">Categoría:</strong> {ticket.categoria}</span>
        <span><strong className="text-slate-700">Prioridad:</strong> {ticket.prioridad}</span>
        {fecha && <span><strong className="text-slate-700">Fecha:</strong> {fecha}</span>}
      </div>
    </section>;
}
function AttachmentChip({ file }) {
  return <div className="flex items-center gap-2 border border-slate-200 bg-slate-50 py-2 pl-3 pr-2.5">
      <PaperclipIcon />
      <a href={fileUrl(file)} target="_blank" rel="noreferrer" className="max-w-[200px] truncate text-sm font-medium text-slate-700 hover:text-[#0076e3] hover:underline">
        {file.nombre_original || file.nombre}
      </a>
      {file.es_principal && <Badge tone="blue">Principal</Badge>}
    </div>;
}
function NotaCard({ nota }) {
  return <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-slate-200 text-xs font-bold text-slate-600">
        {initials(nota.autor)}
      </div>
      <div className="min-w-0 flex-1 border border-slate-200 bg-slate-50 px-3.5 py-2.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <strong className="text-sm text-slate-700">{nota.autor}</strong>
          <span className="shrink-0 text-xs text-slate-400">{formatFecha(nota.fecha_creacion)}</span>
        </div>
        <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-600">{nota.nota}</p>
      </div>
    </div>;
}
export default function BaseConocimientoDetail({
  detail,
  ticketReferencia,
  notas = [],
  isOwner,
  onBack,
  onEdit,
  onPublish,
  onArchive,
  onDelete,
  onRestore,
  onAddNote
}) {
  if (!detail) {
    return <div className="flex h-full items-center justify-center text-slate-500">
        Cargando artículo…
      </div>;
  }
  const isTrashed = detail.activo === false;
  const fecha = formatFecha(detail.fecha_publicacion || detail.fecha_creacion);
  return <div className="h-full min-h-0 overflow-y-auto bg-slate-50">
      <div className="border-b bg-white p-6">
        {onBack && <BackButton onBack={onBack} />}

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-gradient-to-br from-[#0076e3] to-[#1599e8] text-base font-bold text-white shadow-sm">
              {initials(detail.autor)}
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-bold leading-tight text-slate-800">{detail.titulo}</h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
                <span className="font-semibold text-slate-700">{detail.autor}</span>
                <span aria-hidden="true">·</span>
                <span>{detail.categoria}</span>
                {fecha && <>
                  <span aria-hidden="true">·</span>
                  <span>{fecha}</span>
                </>}
              </div>
              <div className="mt-2.5 flex gap-2">
                {isTrashed
                  ? <Badge tone="red">Eliminado</Badge>
                  : <Badge tone={getStatusTone(detail.estado)}>{detail.estado}</Badge>}
              </div>
            </div>
          </div>

          {isOwner && <BaseConocimientoDetailMenu
              isTrashed={isTrashed}
              estado={detail.estado}
              onEdit={onEdit}
              onPublish={onPublish}
              onArchive={onArchive}
              onDelete={onDelete}
              onRestore={onRestore}
            />}
        </div>
      </div>

      <div className="space-y-5 p-6">
        <TicketReferenciaCard ticket={ticketReferencia} />

        <section className="space-y-5 border border-slate-200 bg-white p-6 shadow-sm">
          <FieldBlock title="Descripción" value={detail.descripcion} first />
          {detail.solucion && <FieldBlock title="Solución" value={detail.solucion} />}
          {detail.notas && <FieldBlock title="Notas del autor" value={detail.notas} />}

          <div className="border-t border-slate-100 pt-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Archivos adjuntos ({detail.archivos.length})
              </h3>
            </div>

            {detail.archivos.length === 0
              ? <p className="text-sm text-slate-400">No hay archivos adjuntos.</p>
              : <div className="flex flex-wrap gap-2.5">
                  {detail.archivos.map(file => <AttachmentChip key={file.id} file={file} />)}
                </div>}
          </div>

          <div className="border-t border-slate-100 pt-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Notas adicionales ({notas.length})
              </h3>
              <button type="button" onClick={onAddNote} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                + Dejar nota
              </button>
            </div>

            {notas.length === 0
              ? <p className="text-sm text-slate-400">
                  Aún no hay notas. Si notas que falta algo en esta guía, sé el primero en complementarla.
                </p>
              : <div className="space-y-3">
                  {notas.map(nota => <NotaCard key={nota.id} nota={nota} />)}
                </div>}
          </div>
        </section>
      </div>
    </div>;
}
