import { FileImage, Paperclip } from "lucide-react";
import sinBusquedaIcon from "../../../assets/SinBusqueda.png";
import { Badge } from "./BaseConocimientoPrimitives.jsx";
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
function formatFecha(value) {
  if (!value) return "";
  const date = new Date(value);
  return `${date.getDate()} ${MESES[date.getMonth()]}`;
}
function AttachmentChip({ nombre, tipo, isSelected }) {
  const AttachmentIcon = tipo?.startsWith("image/") ? FileImage : Paperclip;
  return <div className={`mt-1.5 inline-flex items-center gap-1.5 border px-2 py-1 text-xs ${
      isSelected ? "border-white/30 bg-white/10 text-white" : "border-slate-200 bg-slate-50 text-slate-600"
    }`}>
      <AttachmentIcon className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-white/80" : "text-orange-500"}`} strokeWidth={1.75} />
      <span className="max-w-[160px] truncate">{nombre}</span>
    </div>;
}
export default function BaseConocimientoSidebar({
  articles,
  folderLabel,
  loading,
  selectedId,
  onOpen
}) {
  return <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between p-4">
        <h2 className="font-bold text-slate-800">{folderLabel}</h2>
        <Badge tone="blue">{articles.length}</Badge>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {loading ? (
          <p className="p-4 text-sm text-slate-500">Cargando…</p>
        ) : articles.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-slate-500">
            <img src={sinBusquedaIcon} alt="" aria-hidden="true" className="h-20 w-20 object-contain" />
            No hay resultados.
          </div>
        ) : (
          articles.map(article => {
            const isSelected = selectedId === article.id;

            return <button
                key={article.id}
                type="button"
                onClick={() => onOpen(article.id)}
                className={`mb-1 w-full border p-2.5 text-left shadow ${
                  isSelected
                    ? "border-[#0076e3] bg-[#0076e3] text-white"
                    : "border-transparent hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-[130px] shrink-0 truncate text-sm font-semibold ${isSelected ? "text-white" : "text-slate-800"}`}>
                    {article.autor || "No disponible"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className={`truncate text-sm ${isSelected ? "text-white/90" : "text-slate-500"}`}>
                      <span className={isSelected ? "text-white" : "text-slate-700"}>{article.titulo}</span>
                      {" - "}{article.resumen}
                    </div>
                    {article.archivo_nombre && <AttachmentChip nombre={article.archivo_nombre} tipo={article.archivo_tipo} isSelected={isSelected} />}
                  </div>

                  <div className={`shrink-0 text-xs ${isSelected ? "text-white/70" : "text-slate-400"}`}>
                    {formatFecha(article.fecha_publicacion)}
                  </div>
                </div>
              </button>;
          })
        )}
      </div>
    </div>;
}
