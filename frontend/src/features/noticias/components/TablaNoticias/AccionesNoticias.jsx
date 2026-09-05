import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Archive, CheckCircle2, EllipsisVertical, Eye, Pencil, RotateCcw, Trash2 } from "lucide-react";

const MENU_WIDTH = 290;
const MENU_GAP = 6;

function AccionesNoticias({ noticia, estados, usuarioActual, onVer, onEditar, onEliminar, onCambiarEstado, onEliminarDefinitivamente }) {
  const esAdministrador = usuarioActual?.rol === "Administrador";
  const esAutor = Number(usuarioActual?.id) === Number(noticia.usuario_id);
  const puedeGestionarEstado = esAdministrador || esAutor;
  const [abierto, setAbierto] = useState(false);
  const [posicion, setPosicion] = useState({ top: 0, left: 0, width: MENU_WIDTH });
  const botonRef = useRef(null);
  const menuRef = useRef(null);

  const cerrar = () => setAbierto(false);

  const alternarMenu = event => {
    event.stopPropagation();
    const rect = botonRef.current?.getBoundingClientRect();
    if (rect) {
      const width = Math.min(MENU_WIDTH, window.innerWidth * 0.78);
      const left = Math.min(Math.max(12, rect.right - width), window.innerWidth - width - 12);
      setPosicion({ top: rect.bottom + MENU_GAP, left, width });
    }
    setAbierto(valor => !valor);
  };

  useLayoutEffect(() => {
    if (!abierto) return;
    const rect = botonRef.current?.getBoundingClientRect();
    const menuHeight = menuRef.current?.getBoundingClientRect().height;
    if (!rect || !menuHeight) return;
    const espacioInferior = window.innerHeight - rect.bottom;
    const abrirHaciaArriba = espacioInferior < menuHeight + MENU_GAP;
    const top = abrirHaciaArriba
      ? Math.max(12, rect.top - menuHeight - MENU_GAP)
      : rect.bottom + MENU_GAP;
    setPosicion(actual => actual.top === top ? actual : { ...actual, top });
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return undefined;

    const cerrarFuera = event => {
      if (!botonRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) cerrar();
    };
    const cerrarAlMover = () => cerrar();

    document.addEventListener("pointerdown", cerrarFuera);
    window.addEventListener("resize", cerrarAlMover);
    window.addEventListener("scroll", cerrarAlMover, true);
    return () => {
      document.removeEventListener("pointerdown", cerrarFuera);
      window.removeEventListener("resize", cerrarAlMover);
      window.removeEventListener("scroll", cerrarAlMover, true);
    };
  }, [abierto]);

  const ejecutar = accion => {
    cerrar();
    accion();
  };
  const estadoPorNombre = nombre => estados.find(estado => estado.nombre === nombre);
  const publicada = estadoPorNombre("Publicada");
  const archivada = estadoPorNombre("Archivada");

  return <>
    <button
      ref={botonRef}
      type="button"
      onClick={alternarMenu}
      aria-label={`Mostrar acciones de ${noticia.titulo}`}
      aria-haspopup="menu"
      aria-expanded={abierto}
      className={`noticias-actions-trigger mx-auto flex h-9 w-9 items-center justify-center bg-white/90 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0076e3] ${abierto ? "bg-slate-100" : ""}`}
    >
      <EllipsisVertical className="h-5 w-5 text-slate-500" strokeWidth={2} aria-hidden="true" />
    </button>

    {abierto && createPortal(
      <div
        ref={menuRef}
        role="menu"
        className="noticias-actions-menu fixed z-[100] overflow-hidden border border-slate-200 bg-white p-1.5 shadow-[0_16px_40px_rgba(30,34,43,0.2)]"
        style={{ top: posicion.top, left: posicion.left, width: posicion.width }}
      >
        <MenuItem icon={Eye} label="Ver detalles" tone="view" onClick={() => ejecutar(() => onVer(noticia))} />
        {noticia.estado !== "Eliminada" && <MenuItem icon={Pencil} label="Editar noticia" tone="edit" onClick={() => ejecutar(() => onEditar(noticia))} />}
        {puedeGestionarEstado && noticia.estado === "Publicada" && archivada && <MenuItem icon={Archive} label="Archivar noticia" tone="archive" onClick={() => ejecutar(() => onCambiarEstado(noticia, archivada))} />}
        {puedeGestionarEstado && noticia.estado === "Archivada" && publicada && <MenuItem icon={CheckCircle2} label="Publicar noticia" tone="publish" onClick={() => ejecutar(() => onCambiarEstado(noticia, publicada))} />}
        {puedeGestionarEstado && noticia.estado === "Eliminada" && publicada && <MenuItem icon={RotateCcw} label="Restaurar y publicar" tone="publish" onClick={() => ejecutar(() => onCambiarEstado(noticia, publicada))} />}
        {puedeGestionarEstado && noticia.estado === "Eliminada" && <>
          <div className="my-1 border-t border-slate-100" />
          <MenuItem icon={Trash2} label="Eliminar definitivamente" tone="delete" onClick={() => ejecutar(() => onEliminarDefinitivamente(noticia))} />
        </>}
        {puedeGestionarEstado && noticia.estado !== "Eliminada" && <>
          <div className="my-1 border-t border-slate-100" />
          <MenuItem icon={Trash2} label="Eliminar noticia" tone="delete" onClick={() => ejecutar(() => onEliminar(noticia))} />
        </>}
      </div>,
      document.body
    )}
  </>;
}

const TONE_CLASSES = {
  view: "hover:bg-slate-100",
  edit: "hover:bg-amber-50 hover:text-amber-800",
  archive: "hover:bg-amber-50 hover:text-amber-800",
  publish: "hover:bg-emerald-50 hover:text-emerald-700",
  delete: "hover:bg-red-50 hover:text-red-700",
};

function MenuItem({ icon: Icon, label, onClick, tone }) {
  return <button
    type="button"
    role="menuitem"
    onClick={onClick}
    className={`noticias-actions-menu-item flex w-full items-center gap-3 px-2.5 py-2 text-left text-sm font-medium text-slate-700 transition-colors ${TONE_CLASSES[tone]}`}
  >
    <Icon className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
    <span>{label}</span>
  </button>;
}

export default AccionesNoticias;
