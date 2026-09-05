import { useState } from "react";
import { FormModal, ModalFooter } from "../../../../shared/ui/modals/index.js";

export default function TransferTicketsModal({ usuario, plan, saving = false, onClose, onConfirm }) {
  const [technicianId, setTechnicianId] = useState("");

  if (!usuario || !plan) return null;

  return <FormModal
    abierto
    onClose={saving ? () => {} : onClose}
    maxWidth="max-w-lg"
    eyebrow="Continuidad del servicio"
    titulo="Transferir tickets pendientes"
    descripcion={`${usuario.nombre} ${usuario.apellido} tiene ${plan.total} ticket${plan.total === 1 ? "" : "s"} activo${plan.total === 1 ? "" : "s"}.`}
    footer={
      <ModalFooter
        onCancel={onClose}
        cancelDisabled={saving}
        onConfirm={() => onConfirm(Number(technicianId))}
        confirmDisabled={!technicianId || saving}
        confirmLabel={saving ? "Transfiriendo…" : "Confirmar transferencia"}
      />
    }
  >
    <p className="text-sm font-semibold text-slate-700">Selecciona quién continuará atendiendo estos casos:</p>
    <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
      {plan.tecnicos.map(tecnico => {
        const selected = String(technicianId) === String(tecnico.id);
        return <label key={tecnico.id} className={`flex cursor-pointer items-center justify-between gap-4 rounded border px-4 py-3 transition-colors ${selected ? "border-[#0076e3] bg-[#eaf4ff]" : "border-slate-200 bg-white hover:border-slate-300"}`}>
          <span className="flex min-w-0 items-center gap-3">
            <input type="radio" name="tecnico_transferencia" value={tecnico.id} checked={selected} onChange={event => setTechnicianId(event.target.value)} className="h-4 w-4 accent-[#0076e3]" />
            <span className="min-w-0">
              <strong className="block truncate text-sm text-[#1e222b]">{tecnico.nombre}</strong>
              <span className="text-xs text-slate-500">{tecnico.tickets_activos} tickets activos actualmente</span>
            </span>
          </span>
        </label>;
      })}
      {plan.tecnicos.length === 0 && <div className="rounded bg-amber-50 px-4 py-3 text-sm text-amber-800">
        No existe un técnico activo que cubra todas las categorías involucradas. Asigna primero esas categorías a otro técnico.
      </div>}
    </div>
  </FormModal>;
}
