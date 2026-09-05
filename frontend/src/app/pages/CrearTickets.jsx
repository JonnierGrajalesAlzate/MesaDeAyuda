import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayoutUsuario.jsx";
import { crearTicket } from "../../features/tickets/services/ticketService.js";
import { obtenerCategorias, obtenerPrioridades, obtenerSubcategorias } from "../../features/tickets/services/catalogosService.js";
import alerta from "../../shared/services/alertService.js";
import logo2 from "../../assets/logo2.png";

const MAX_DESCRIPCION = 1200;
const TIPOS_PERMITIDOS = new Set(["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"]);
const ARCHIVO_NO_PERMITIDO = {
  icon: "warning",
  title: "Archivo no permitido",
  text: "Solo se aceptan imágenes (JPG, PNG, GIF, WEBP) o archivos PDF."
};

function CrearTickets() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [categorias, setCategorias] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [archivo, setArchivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    categoria_id: "",
    subcategoria_id: "",
    es_critico: false
  });

  useEffect(() => {
    let active = true;
    Promise.all([obtenerCategorias(), obtenerPrioridades()]).then(([categoriasData, prioridadesData]) => {
      if (!active) return;
      setCategorias(categoriasData);
      setPrioridades(prioridadesData);
    }).catch(error => {
      console.error("Error cargando catálogos", error);
    });
    const handlePaste = event => {
      const items = event.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file && TIPOS_PERMITIDOS.has(file.type)) {
            setArchivo(file);
            alerta.fire({
              icon: "success",
              title: "Captura adjuntada",
              text: "La evidencia se agregó correctamente.",
              timer: 2400
            });
          }
          break;
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => {
      active = false;
      window.removeEventListener("paste", handlePaste);
    };
  }, []);

  useEffect(() => {
    if (!formData.categoria_id) return undefined;
    let active = true;
    obtenerSubcategorias(formData.categoria_id).then(data => {
      if (!active) return;
      setSubcategorias(Array.isArray(data) ? data : []);
    }).catch(() => {
      if (active) setSubcategorias([]);
    });
    return () => {
      active = false;
    };
  }, [formData.categoria_id]);

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const setField = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));
  const selectCategoria = categoriaId => {
    setFormData(prev => ({ ...prev, categoria_id: categoriaId, subcategoria_id: "", descripcion: "" }));
    setSubcategorias([]);
  };
  const selectSubcategoria = subcategoria => setFormData(prev => (subcategoria === "otro"
    ? { ...prev, subcategoria_id: "otro", descripcion: "" }
    : { ...prev, subcategoria_id: subcategoria.id, descripcion: subcategoria.descripcion }));

  const handleFileChange = e => {
    const file = e.target.files?.[0] || null;
    if (file && !TIPOS_PERMITIDOS.has(file.type)) {
      alerta.fire(ARCHIVO_NO_PERMITIDO);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setArchivo(file);
  };
  const handleRemoveFile = () => {
    setArchivo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handleDragOver = e => {
    e.preventDefault();
    setArrastrando(true);
  };
  const handleDragLeave = () => setArrastrando(false);
  const handleDrop = e => {
    e.preventDefault();
    setArrastrando(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!TIPOS_PERMITIDOS.has(file.type)) {
      alerta.fire(ARCHIVO_NO_PERMITIDO);
      return;
    }
    setArchivo(file);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (enviando) return;

    const camposFaltantes = [{
      nombre: "título",
      completo: formData.titulo.trim()
    }, {
      nombre: "categoría",
      completo: formData.categoria_id
    }, {
      nombre: "descripción",
      completo: formData.descripcion.trim()
    }].filter(campo => !campo.completo).map(campo => campo.nombre);

    if (camposFaltantes.length > 0) {
      alerta.fire({
        icon: "warning",
        title: "Completa los campos obligatorios",
        text: `Debes diligenciar: ${camposFaltantes.join(", ")}.`
      });
      return;
    }

    setEnviando(true);

    try {
      const data = new FormData();
      data.append("titulo", formData.titulo.trim());
      data.append("descripcion", formData.descripcion.trim());
      data.append("categoria_id", formData.categoria_id);
      if (formData.subcategoria_id && formData.subcategoria_id !== "otro") {
        data.append("subcategoria_id", formData.subcategoria_id);
      }
      data.append("es_critico", formData.es_critico ? "true" : "false");
      if (archivo) {
        data.append("adjunto", archivo);
      }

      const response = await crearTicket(data);
      const ticketId = Number(response?.ticket?.id);

      if (!Number.isSafeInteger(ticketId) || ticketId < 1) {
        throw new Error("El servidor no devolvió el identificador del ticket");
      }

      alerta.fire({
        icon: "success",
        title: "Ticket creado correctamente",
        text: `Tu solicitud fue registrada con el número #${ticketId}.`,
        timer: 3500
      });

      navigate(`/tickets/${ticketId}`);
    } catch (error) {
      console.error(error);
      alerta.fire({
        icon: "error",
        title: "No se pudo crear el ticket",
        text: error.response?.data?.message || "Inténtalo nuevamente."
      });
    } finally {
      setEnviando(false);
    }
  };

  const descripcionRestante = MAX_DESCRIPCION - formData.descripcion.length;
  const categoriaSeleccionada = categorias.find(categoria => String(categoria.id) === String(formData.categoria_id));
  const subcategoriaSeleccionada = subcategorias.find(subcategoria => String(subcategoria.id) === String(formData.subcategoria_id));
  const prioridadCategoria = prioridades.find(prioridad => String(prioridad.id) === String(categoriaSeleccionada?.prioridad_id));
  const prioridadSubcategoria = subcategoriaSeleccionada ? prioridades.find(prioridad => String(prioridad.id) === String(subcategoriaSeleccionada.prioridad_id)) : null;
  const prioridadBase = prioridadSubcategoria || prioridadCategoria;
  const prioridadAlta = prioridades.find(prioridad => String(prioridad.nombre).trim().toLowerCase() === "alta");
  const prioridadAsignada = formData.es_critico ? (prioridadAlta || prioridadBase) : prioridadBase;
  const descripcionBloqueada = subcategorias.length > 0 && formData.subcategoria_id !== "otro";

  const archivoEsImagen = archivo?.type?.startsWith("image/") ?? false;
  const archivoPreviewUrl = useMemo(
    () => (archivo && archivoEsImagen ? URL.createObjectURL(archivo) : null),
    [archivo, archivoEsImagen]
  );
  useEffect(() => () => {
    if (archivoPreviewUrl) URL.revokeObjectURL(archivoPreviewUrl);
  }, [archivoPreviewUrl]);
  const archivoPartes = archivo?.name.split(".") ?? [];
  const archivoExtension = archivoPartes.length > 1 ? archivoPartes.pop().toUpperCase() : "";
  const archivoNombreBase = archivoPartes.join(".") || archivo?.name || "";

  return <DashboardLayout>

            <div className="create-ticket-page space-y-6">

                <div className="create-ticket-hero">
                    <img src={logo2} alt="" className="create-ticket-hero-logo" />
                    <h1 className="create-ticket-hero-title">Nueva solicitud</h1>
                </div>

                <form noValidate onSubmit={handleSubmit} className="azure-panel space-y-5 p-6">

                        <div>
                            <label className="mb-2 block font-bold text-slate-900">
                                Título <span className="text-red-600" aria-hidden="true">*</span>
                            </label>
                            <input
                              type="text"
                              name="titulo"
                              value={formData.titulo}
                              onChange={handleChange}
                              placeholder="Ej: No puedo acceder al correo corporativo"
                              className="create-ticket-input"
                              maxLength={150}
                            />
                        </div>

                        <div>
                            <label className="mb-2 block font-bold text-slate-900">
                                Categoría <span className="text-red-600" aria-hidden="true">*</span>
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                                {categorias.map(categoria => {
                                  const seleccionada = String(formData.categoria_id) === String(categoria.id);
                                  return <span key={categoria.id} className="relative inline-flex">
                                    <button
                                      type="button"
                                      aria-pressed={seleccionada}
                                      onClick={() => selectCategoria(categoria.id)}
                                      className={`create-ticket-pill${seleccionada ? " is-selected has-clear" : ""}`}
                                    >
                                      {categoria.nombre}
                                    </button>
                                    {seleccionada && <button
                                      type="button"
                                      aria-label={`Quitar selección de ${categoria.nombre}`}
                                      onClick={() => selectCategoria("")}
                                      className="create-ticket-pill-clear"
                                    >
                                        <X className="h-2.5 w-2.5" strokeWidth={3} aria-hidden="true" />
                                    </button>}
                                  </span>;
                                })}
                                {categorias.length === 0 && <span className="text-sm text-slate-400">Cargando categorías…</span>}
                            </div>
                        </div>

                        {categoriaSeleccionada && subcategorias.length > 0 && (
                          <div>
                              <label className="mb-2 block font-bold text-slate-900">
                                  ¿Cuál describe mejor tu problema? <span className="text-red-600" aria-hidden="true">*</span>
                              </label>
                              <div className="flex flex-wrap gap-1.5">
                                  {subcategorias.map(subcategoria => {
                                    const seleccionada = String(formData.subcategoria_id) === String(subcategoria.id);
                                    return (
                                      <button
                                        key={subcategoria.id}
                                        type="button"
                                        aria-pressed={seleccionada}
                                        onClick={() => selectSubcategoria(subcategoria)}
                                        className={`create-ticket-pill${seleccionada ? " is-selected" : ""}`}
                                      >
                                        {subcategoria.descripcion}
                                      </button>
                                    );
                                  })}
                                  <button
                                    type="button"
                                    aria-pressed={formData.subcategoria_id === "otro"}
                                    onClick={() => selectSubcategoria("otro")}
                                    className={`create-ticket-pill${formData.subcategoria_id === "otro" ? " is-selected" : ""}`}
                                  >
                                      Otro
                                  </button>
                              </div>
                          </div>
                        )}

                        <div>
                            <label className="mb-2 block font-bold text-slate-900">
                                Prioridad
                            </label>
                            {categoriaSeleccionada ? (
                              <span
                                className="create-ticket-pill create-ticket-pill--priority is-selected inline-flex w-auto"
                                style={{ "--pill-color": prioridadAsignada?.color || "#0076e3" }}
                              >
                                <span className="create-ticket-pill-dot" aria-hidden="true" />
                                {prioridadAsignada?.nombre || "Sin prioridad configurada"}
                              </span>
                            ) : null}
                            {!categoriaSeleccionada && (
                              <p className="mt-1.5 text-sm text-slate-400">
                                  La prioridad se asigna automáticamente según la categoría
                              </p>
                            )}

                            <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-sm text-slate-700">
                                <input
                                  type="checkbox"
                                  checked={formData.es_critico}
                                  onChange={e => setField("es_critico", e.target.checked)}
                                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#0076e3]"
                                />
                                <span className="text-sm font-normal text-slate-700">
                                    Este problema afecta a varias personas
                                </span>
                            </label>
                        </div>

                        <div>
                            <div className="mb-2 flex items-end justify-between">
                                <label className="block font-bold text-slate-900">
                                    Descripción <span className="text-red-600" aria-hidden="true">*</span>
                                </label>
                                <span className={`create-ticket-counter${descripcionRestante < 0 ? " is-over" : ""}`}>
                                    {formData.descripcion.length}/{MAX_DESCRIPCION}
                                </span>
                            </div>
                            <textarea
                              name="descripcion"
                              value={formData.descripcion}
                              onChange={handleChange}
                              rows="6"
                              disabled={descripcionBloqueada}
                              placeholder={descripcionBloqueada
                                ? "Selecciona una opción arriba, o elige “Otro” para escribir tu propia descripción."
                                : "Describe detalladamente el problema: qué intentabas hacer, qué pasó y desde cuándo."}
                              className="create-ticket-input resize-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                              maxLength={MAX_DESCRIPCION}
                            />
                        </div>

                        <div>
                            <label className="mb-2 block font-bold text-slate-900">
                                Evidencia del problema <span className="font-normal text-slate-500">(opcional)</span>
                            </label>

                            <div
                              className={`create-ticket-dropzone${arrastrando ? " is-dragging" : ""}${archivo ? " has-file" : ""}`}
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                            >
                                {!archivo && <>
                                    <svg className="create-ticket-dropzone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M7 18a4.5 4.5 0 0 1-1-8.9A5 5 0 0 1 15.5 7 4.5 4.5 0 0 1 17 16" />
                                        <path d="M12 12v7m0-7 3 3m-3-3-3 3" />
                                    </svg>
                                    <p className="mt-3 text-sm text-slate-600">
                                        Arrastra un archivo aquí o{" "}
                                        <label className="create-ticket-browse">
                                            selecciona uno
                                            <input
                                              ref={fileInputRef}
                                              type="file"
                                              accept="image/*,application/pdf"
                                              onChange={handleFileChange}
                                              className="sr-only"
                                            />
                                        </label>
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">Imágenes (JPG, PNG, GIF, WEBP) o PDF · o presiona Ctrl + V para pegar una captura de pantalla</p>
                                </>}

                                {archivo && <div className="create-ticket-file">
                                    {archivoEsImagen
                                      ? <img src={archivoPreviewUrl} alt="Vista previa" className="create-ticket-file-thumb" />
                                      : <span className="create-ticket-file-icon create-ticket-file-icon--pdf" aria-hidden="true">
                                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                              <path d="M14 3v4a1 1 0 0 0 1 1h4M6 3h8l6 6v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
                                          </svg>
                                        </span>}
                                    <div className="create-ticket-file-info">
                                        <strong>{archivoNombreBase}</strong>
                                        <span className="create-ticket-file-meta">
                                            {archivoExtension && <span className="create-ticket-file-ext">{archivoExtension}</span>}
                                            {(archivo.size / 1024).toFixed(0)} KB
                                        </span>
                                    </div>
                                    <button type="button" onClick={handleRemoveFile} className="create-ticket-file-remove" aria-label="Quitar archivo adjunto">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                                    </button>
                                </div>}
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button type="submit" disabled={enviando} className="create-ticket-submit create-ticket-submit--auto">
                                {enviando ? "Creando ticket…" : "Crear ticket"}
                            </button>
                        </div>

                </form>
            </div>
        </DashboardLayout>;
}
export default CrearTickets;
