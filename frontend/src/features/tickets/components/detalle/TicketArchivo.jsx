import { useState } from "react";
import { Download, FileImage, FileText } from "lucide-react";
import { API_ORIGIN } from "../../../../shared/services/httpClient.js";
import alerta from "../../../../shared/services/alertService.js";
import { PreviewModal } from "../../../../shared/ui/modals/index.js";
import archivoIcon from "../../../../assets/imagenes.png";

const EXTENSIONES_IMAGEN = /\.(jpe?g|png|gif|webp|bmp|svg)$/i;
const EXTENSIONES_PDF = /\.pdf$/i;

function formatearTamano(bytes) {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value <= 0) return null;
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(0)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

async function descargarArchivo(url, nombreArchivo) {
  try {
    const response = await fetch(url, { credentials: "include" });
    if (!response.ok) throw new Error("No se pudo descargar el archivo");
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = nombreArchivo || "archivo";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    await alerta.fire({
      icon: "error",
      title: "No se pudo descargar el archivo",
      confirmButtonColor: "#0076e3"
    });
  }
}

function FileIcon() {
  return (
    <span className="ticket-file-icon">
      <img src={archivoIcon} alt="" aria-hidden="true" />
    </span>
  );
}

function TicketArchivo({ ticket }) {
  const [previsualizando, setPrevisualizando] = useState(false);
  const [imagenError, setImagenError] = useState(false);
  const nombreReferencia = ticket?.ruta_archivo || ticket?.nombre_archivo || "";
  const esImagen = EXTENSIONES_IMAGEN.test(nombreReferencia);
  const esPdf = EXTENSIONES_PDF.test(nombreReferencia);
  const esVisualizable = esImagen || esPdf;
  const urlArchivo = ticket?.ruta_archivo
    ? `${API_ORIGIN}/ticket/${ticket.id}/${encodeURIComponent(ticket.nombre_archivo || ticket.ruta_archivo)}`
    : null;
  const tamano = formatearTamano(ticket?.tamano_archivo);
  const mostrarImagen = esImagen && !imagenError;

  return (
    <section className="ticket-detail-section">
      <h4>Archivo adjunto</h4>

      {!ticket?.nombre_archivo && <p className="ticket-detail-empty">No hay archivos adjuntos.</p>}

      {ticket?.nombre_archivo && esVisualizable && <>
        <div className="ticket-file-card">
          <div className="ticket-file-card-preview">
            {mostrarImagen
              ? <img src={urlArchivo} alt="" className="ticket-file-card-img" onError={() => setImagenError(true)} />
              : <span className="ticket-file-card-fallback-cover">
                  {esPdf
                    ? <FileText className="ticket-file-card-fallback-icon" strokeWidth={1.5} aria-hidden="true" />
                    : <FileImage className="ticket-file-card-fallback-icon" strokeWidth={1.5} aria-hidden="true" />}
                </span>}
            <button
              type="button"
              onClick={() => setPrevisualizando(true)}
              className="ticket-file-card-trigger"
              aria-label={`Ver ${ticket.nombre_archivo}`}
            />
            <div className="ticket-file-card-actions">
              {tamano && <span className="ticket-file-card-size">{tamano}</span>}
              <button
                type="button"
                onClick={() => descargarArchivo(urlArchivo, ticket.nombre_archivo)}
                className="ticket-file-card-download"
                aria-label="Descargar archivo"
                title="Descargar archivo"
              >
                <Download className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </div>
          <p className="ticket-file-card-name">{ticket.nombre_archivo}</p>
        </div>

        <PreviewModal abierto={previsualizando} onClose={() => setPrevisualizando(false)} titulo={ticket.nombre_archivo} urlAbrir={urlArchivo}>
          {mostrarImagen
            ? <img src={urlArchivo} alt={ticket.nombre_archivo} onError={() => setImagenError(true)} />
            : esPdf
              ? <iframe src={urlArchivo} title={ticket.nombre_archivo} className="ticket-preview-pdf" />
              : <p className="ticket-preview-error">No se pudo cargar la imagen.</p>}
        </PreviewModal>
      </>}

      {ticket?.nombre_archivo && !esVisualizable && (
        <a href={urlArchivo} target="_blank" rel="noreferrer" className="ticket-file-link">
          <FileIcon />
          <span>
            <strong>{ticket.nombre_archivo}</strong>
            <small>Abrir archivo</small>
          </span>
        </a>
      )}
    </section>
  );
}

export default TicketArchivo;
