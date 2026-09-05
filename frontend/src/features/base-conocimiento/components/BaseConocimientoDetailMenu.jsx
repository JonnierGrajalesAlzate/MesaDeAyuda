import { useEffect, useRef, useState } from "react";
import { Archive, MoreVertical, Pencil, RotateCcw, Trash2, Upload } from "lucide-react";
function MenuOption({ icon: IconComponent, label, onClick }) {
  return <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100"
    >
      <IconComponent className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
      <span>{label}</span>
    </button>;
}
export default function BaseConocimientoDetailMenu({
  isTrashed,
  estado,
  onEdit,
  onPublish,
  onArchive,
  onDelete,
  onRestore
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOutside = event => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [menuOpen]);

  const execute = action => {
    setMenuOpen(false);
    action();
  };

  return <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setMenuOpen(current => !current)}
        aria-label="Más opciones del artículo"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        className="flex h-9 w-9 items-center justify-center border border-slate-200 bg-white text-slate-500 transition hover:border-[#0076e3] hover:text-[#0076e3]"
      >
        <MoreVertical className="h-[18px] w-[18px]" strokeWidth={2} />
      </button>

      {menuOpen && <div role="menu" className="absolute right-0 top-full z-10 mt-1 min-w-[220px] border border-slate-200 bg-white py-2 shadow-lg">
          {isTrashed ? (
            <MenuOption icon={RotateCcw} label="Restaurar" onClick={() => execute(onRestore)} />
          ) : (
            <>
              <MenuOption icon={Pencil} label="Editar" onClick={() => execute(onEdit)} />
              {estado !== "PUBLICADO" && <MenuOption icon={Upload} label="Publicar" onClick={() => execute(onPublish)} />}
              {estado !== "ARCHIVADO" && <MenuOption icon={Archive} label="Archivar" onClick={() => execute(onArchive)} />}
              <MenuOption icon={Trash2} label="Eliminar" onClick={() => execute(onDelete)} />
            </>
          )}
        </div>}
    </div>;
}
