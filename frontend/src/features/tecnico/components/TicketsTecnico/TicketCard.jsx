import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, ClipboardCheck, EllipsisVertical, X } from "lucide-react";

function TicketCard({
  ticket,
  onVerDetalle,
  onTomarTicket,
  onAceptarSolicitud,
  onRechazarSolicitud
}) {
  const estadoColor = ticket.color || ticket.estado_color || "#0076e3";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOnOutsideClick = event => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const closeOnEscape = event => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  return <div className="azure-panel tecnico-ticket-card
                w-full p-5 min-h-[320px]
                flex
                flex-col
            " style={{
    borderTop: `3px solid ${estadoColor}`
  }}>

            {/* Encabezado */}

            <div className="
                    flex
                    justify-between
                    items-start
                    gap-4
                ">

                <div className="
                        flex-1
                        min-w-0
                    ">

                    <span className="
                            inline-flex
                            items-center
                            px-3
                            py-1
                            rounded-full
                            bg-blue-50
                            text-[#0076e3]
                            text-xs
                            font-bold
                        ">

                        Ticket #{ticket.id}

                    </span>

                    <h2 className="
                            mt-3
                            text-lg
                            font-bold
                            text-[#1e222b]
                            leading-tight
                            line-clamp-2
                        ">

                        {ticket.titulo}

                    </h2>

                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <span className="
                            px-4
                            py-2
                            rounded-full
                            text-sm
                            font-semibold
                            whitespace-nowrap
                        " style={{
        backgroundColor: `${estadoColor}20`,
        color: estadoColor
      }}>

                        {ticket.estado}

                    </span>

                    {!ticket.solicitud_reasignacion_id && !ticket.disponible && <button
                      type="button"
                      onClick={() => onVerDetalle(ticket)}
                      aria-label="Ver más detalles"
                      title="Ver más detalles"
                      className="flex h-8 w-8 shrink-0 items-center justify-center text-slate-500 transition hover:text-[#0076e3]"
                    >
                        <ArrowUpRight className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
                    </button>}

                    {(ticket.disponible || ticket.solicitud_reasignacion_id) && <div className="relative" ref={menuRef}>
                        <button
                          type="button"
                          onClick={() => setMenuOpen(open => !open)}
                          aria-haspopup="menu"
                          aria-expanded={menuOpen}
                          aria-label="Más opciones"
                          title="Más opciones"
                          className="flex h-8 w-8 shrink-0 items-center justify-center border border-slate-200 bg-white text-slate-500 transition hover:border-[#0076e3] hover:text-[#0076e3]"
                        >
                            <EllipsisVertical className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                        </button>

                        {menuOpen && <div role="menu" className="absolute right-0 top-full z-10 mt-1 min-w-[180px] rounded border border-slate-200 bg-white py-1 shadow-lg">
                            {ticket.disponible && <button
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                setMenuOpen(false);
                                onTomarTicket(ticket);
                              }}
                              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50"
                            >
                                <ClipboardCheck className="h-4 w-4 shrink-0" strokeWidth={2} />
                                Tomar ticket
                            </button>}
                            {ticket.solicitud_reasignacion_id && <>
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                  setMenuOpen(false);
                                  onAceptarSolicitud(ticket);
                                }}
                                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50"
                              >
                                  <Check className="h-4 w-4 shrink-0" strokeWidth={2} />
                                  Aceptar solicitud
                              </button>
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                  setMenuOpen(false);
                                  onRechazarSolicitud(ticket);
                                }}
                                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50"
                              >
                                  <X className="h-4 w-4 shrink-0" strokeWidth={2} />
                                  Rechazar solicitud
                              </button>
                            </>}
                        </div>}
                    </div>}
                </div>

            </div>

            {ticket.solicitud_reasignacion_id && <p className="mt-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                    {ticket.solicitud_origen_tecnico} te pidió recibir este ticket
                </p>}

            {/* Descripción */}

            <p className="
                    mt-5
                    text-sm
                    text-slate-600
                    leading-7
                    line-clamp-3
                    flex-1
                ">

                {ticket.descripcion}

            </p>

            {/* Información */}

            <div className="
                    grid
                    grid-cols-2
                    gap-5
                    mt-6
                    pt-6 
                    border-t border-slate-100
                ">

                <div>

                    <p className="
                            text-xs
                            font-bold
                            uppercase
                            tracking-wide
                            text-slate-500
                        ">

                        Usuario

                    </p>

                    <p className="
                            mt-1
                            text-sm
                            text-slate-700
                            truncate
                        ">

                        {ticket.usuario}

                    </p>

                </div>

                <div>

                    <p className="
                            text-xs
                            font-bold
                            uppercase
                            tracking-wide
                            text-slate-500
                        ">

                        Categoría

                    </p>

                    <p className="
                            mt-1
                            text-sm
                            text-slate-700
                            truncate
                        ">

                        {ticket.categoria}

                    </p>

                </div>

                <div>

                    <p className="
                            text-xs
                            font-bold
                            uppercase
                            tracking-wide
                            text-slate-500
                        ">

                        Prioridad

                    </p>

                    <p className="mt-1 inline-flex rounded-full border px-2 py-1 text-sm font-semibold" style={ticket.prioridad_color ? {
          color: ticket.prioridad_color,
          backgroundColor: `${ticket.prioridad_color}22`,
          borderColor: `${ticket.prioridad_color}55`
        } : undefined}>

                        {ticket.prioridad}

                    </p>

                </div>

                <div>

                    <p className="
                            text-xs
                            font-bold
                            uppercase
                            tracking-wide
                            text-slate-500
                        ">

                        Fecha

                    </p>

                    <p className="
                            mt-1
                            text-sm
                            text-slate-700
                        ">

                        {new Date(ticket.fecha_creacion).toLocaleDateString()}

                    </p>

                </div>

            </div>

        </div>;
}
export default TicketCard;
