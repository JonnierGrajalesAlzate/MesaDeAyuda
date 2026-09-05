import { Archive, FilePenLine, Trash2, Upload } from "lucide-react";
const FOLDERS = [
  {
    key: "published",
    label: "Publicadas",
    icon: Upload
  },
  {
    key: "drafts",
    label: "Borradores",
    icon: FilePenLine
  },
  {
    key: "archived",
    label: "Archivadas",
    icon: Archive
  },
  {
    key: "trash",
    label: "Eliminadas",
    icon: Trash2
  }
];

export default function BaseConocimientoFolders({ folder, counts, onSelect }) {
  return (
    <aside className="flex shrink-0 flex-col gap-1 border p-3 shadow-sm lg:w-56">
      <nav className="flex flex-col gap-1">
        {FOLDERS.map(item => {
          const active = folder === item.key;
          const FolderIcon = item.icon;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                active ? "bg-blue-50 text-[#0076e3]" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <FolderIcon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
                {item.label}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${active ? "bg-[#0076e3] text-white" : "bg-slate-100 text-slate-500"}`}>
                {counts[item.key] ?? 0}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
