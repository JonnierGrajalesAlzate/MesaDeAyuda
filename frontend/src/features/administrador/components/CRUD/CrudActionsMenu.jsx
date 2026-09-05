import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Eye, EllipsisVertical, Pencil, Trash2 } from "lucide-react";

const MENU_WIDTH = 290;
const MENU_HEIGHT = 164;
const MENU_GAP = 6;
const TONE_CLASSES = {
  view: "hover:bg-slate-100",
  edit: "hover:bg-amber-50 hover:text-amber-800",
  delete: "hover:bg-red-50 hover:text-red-700",
};

export default function CrudActionsMenu({ itemLabel, viewLabel = "Ver detalles", editLabel, deleteLabel, onView, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: MENU_WIDTH });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const close = () => setOpen(false);

  const toggle = event => {
    event.stopPropagation();
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const width = Math.min(MENU_WIDTH, window.innerWidth * 0.78);
      const left = Math.min(Math.max(12, rect.right - width), window.innerWidth - width - 12);
      const openUp = window.innerHeight - rect.bottom < MENU_HEIGHT + MENU_GAP;
      const top = openUp ? Math.max(12, rect.top - MENU_HEIGHT - MENU_GAP) : rect.bottom + MENU_GAP;
      setPosition({ top, left, width });
    }
    setOpen(value => !value);
  };

  useEffect(() => {
    if (!open) return undefined;
    const closeOutside = event => {
      if (!buttonRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) close();
    };
    document.addEventListener("pointerdown", closeOutside);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open]);

  const run = action => {
    close();
    action?.();
  };

  return <>
    <button ref={buttonRef} type="button" onClick={toggle} aria-label={`Mostrar acciones de ${itemLabel}`} aria-haspopup="menu" aria-expanded={open} className="mx-auto flex h-9 w-9 items-center justify-center rounded-none bg-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0076e3]">
      <EllipsisVertical className="h-5 w-5 text-slate-500" strokeWidth={2} aria-hidden="true" />
    </button>
    {open && createPortal(<div ref={menuRef} role="menu" className="fixed z-[100] overflow-hidden rounded-none border border-slate-200 bg-white p-1.5 shadow-[0_16px_40px_rgba(30,34,43,0.2)]" style={{ top: position.top, left: position.left, width: position.width }}>
      <MenuItem icon={Eye} label={viewLabel} tone="view" onClick={() => run(onView)} />
      <MenuItem icon={Pencil} label={editLabel} tone="edit" onClick={() => run(onEdit)} />
      <div className="my-1 border-t border-slate-100" />
      <MenuItem icon={Trash2} label={deleteLabel} tone="delete" onClick={() => run(onDelete)} />
    </div>, document.body)}
  </>;
}

function MenuItem({ icon: Icon, label, tone, onClick }) {
  return <button type="button" role="menuitem" onClick={onClick} className={`flex w-full items-center gap-3 rounded-none px-2.5 py-2 text-left text-sm font-medium text-slate-700 transition-colors ${TONE_CLASSES[tone]}`}>
    <Icon className="h-4.5 w-4.5 shrink-0" strokeWidth={2} aria-hidden="true" />
    <span>{label}</span>
  </button>;
}
