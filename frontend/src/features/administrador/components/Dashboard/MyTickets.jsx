import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ArrowUpRight } from "lucide-react";
import sinBusquedaIcon from "../../../../assets/SinBusqueda.png";
import alerta from "../../../../shared/services/alertService.js";
import { obtenerDashboardTecnico } from "../../../tecnico/services/dashboardTecnicoService.js";
import { tomarTicket } from "../../../tickets/services/ticketService.js";

const PENDING_STATUS_IDS = new Set([1, 3, 5]);
const PENDING_STATUS_NAMES = new Set(["abierto", "en proceso", "reabierto"]);
const WAITING_STATUS_ID = 4;
const WAITING_STATUS_NAMES = new Set(["espera", "en espera"]);

const TICKET_VIEWS = [
  { id: "pending", label: "Pendientes" },
  { id: "waiting", label: "En espera" },
  { id: "all", label: "Ver todos" }
];

const ALL_VIEW_STATUS_ORDER = ["abierto", "en proceso", "en espera", "cerrado", "reabierto"];

function normalizeStatusName(statusName) {
  return String(statusName || "").trim().toLocaleLowerCase("es-CO");
}

function statusOrderIndex(statusName) {
  const index = ALL_VIEW_STATUS_ORDER.indexOf(normalizeStatusName(statusName));
  return index === -1 ? ALL_VIEW_STATUS_ORDER.length : index;
}

function isWaitingTicket(ticket) {
  return Number(ticket.estado_id) === WAITING_STATUS_ID
    || WAITING_STATUS_NAMES.has(normalizeStatusName(ticket.estado));
}

function isPendingTicket(ticket) {
  if (isWaitingTicket(ticket)) return false;
  return PENDING_STATUS_IDS.has(Number(ticket.estado_id))
    || PENDING_STATUS_NAMES.has(normalizeStatusName(ticket.estado));
}

function groupTicketsByStatus(tickets) {
  return tickets.reduce((groups, ticket) => {
    const statusName = ticket.estado || "Sin estado";
    const group = groups.get(statusName) || {
      name: statusName,
      color: ticket.color || "#c3cfdb",
      tickets: []
    };
    group.tickets.push(ticket);
    groups.set(statusName, group);
    return groups;
  }, new Map());
}

function ChevronIcon({ open }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path d="m5 7.5 5 5 5-5" />
    </svg>
  );
}

function TicketCard({ ticket, onViewTicket, onTakeTicket, takingTicketId }) {
  const isAvailable = Boolean(ticket.disponible);
  const isTakingTicket = Number(takingTicketId) === Number(ticket.id);

  return (
    <article
      className="rounded-none border bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md"
      style={{ borderColor: "#e2e8f0", borderLeftColor: ticket.color || "#c3cfdb", borderLeftWidth: 3 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-xs font-medium uppercase tracking-wider text-[#0076e3]">
            Ticket #{ticket.id}
          </span>
          <h4 className="mt-1 truncate text-sm font-medium text-[#1e222b]" title={ticket.titulo}>
            {ticket.titulo}
          </h4>
          <p className="mt-1 truncate text-xs text-slate-500" title={ticket.usuario}>
            Solicitante: {ticket.usuario}
          </p>
        </div>
        {isAvailable ? (
          <button
            type="button"
            onClick={() => onTakeTicket(ticket)}
            disabled={isTakingTicket}
            className="shrink-0 rounded-none bg-[#0076e3] px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-[#005fbd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0076e3] disabled:cursor-wait disabled:opacity-60"
          >
            {isTakingTicket ? "Tomando…" : "Tomar"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onViewTicket(ticket)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-none text-slate-500 transition-colors hover:bg-blue-50 hover:text-[#0076e3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0076e3]"
            aria-label={`Ver detalle del ticket ${ticket.id}`}
            title="Ver detalle"
          >
            <ArrowUpRight className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          </button>
        )}
      </div>
    </article>
  );
}

/**
 * Muestra únicamente los tickets asignados al administrador autenticado.
 * Reutiliza el filtro por técnico existente; el backend continúa siendo la
 * autoridad que controla el acceso a los datos.
 */
export default function MyTickets({ administratorId, refreshKey }) {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("pending");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(Boolean(administratorId));
  const [error, setError] = useState("");
  const [takingTicketId, setTakingTicketId] = useState(null);
  const [collapsedGroups, setCollapsedGroups] = useState(() => new Set());

  const toggleGroup = name => setCollapsedGroups(current => {
    const next = new Set(current);
    if (next.has(name)) next.delete(name); else next.add(name);
    return next;
  });

  const loadTickets = async () => {
    const response = await obtenerDashboardTecnico(administratorId);
    setTickets(response.tickets || []);
    setError("");
  };

  useEffect(() => {
    let isMounted = true;
    if (!administratorId) return undefined;

    obtenerDashboardTecnico(administratorId)
      .then(response => {
        if (!isMounted) return;
        setTickets(response.tickets || []);
        setError("");
      })
      .catch(requestError => {
        if (isMounted) {
          setError(requestError.response?.data?.message || "No se pudieron cargar tus tickets.");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [administratorId, refreshKey]);

  const viewTicketDetail = ticket => navigate(`/administrador/tickets/${ticket.id}?propio=1`);

  const takeAvailableTicket = async ticket => {
    setTakingTicketId(ticket.id);
    try {
      const response = await tomarTicket(ticket.id);
      await loadTickets();
      await alerta.fire({
        icon: "success",
        title: "Ticket asignado",
        text: response.message,
        timer: 1600,
        showConfirmButton: false
      });
      viewTicketDetail(ticket);
    } catch (requestError) {
      await loadTickets().catch(() => {});
      await alerta.fire({
        icon: "error",
        title: "No se pudo tomar el ticket",
        text: requestError.response?.data?.message || "Otro responsable pudo haber tomado este caso.",
        confirmButtonColor: "#0076e3"
      });
    } finally {
      setTakingTicketId(null);
    }
  };

  const visibleTickets = useMemo(() => {
    if (activeView === "all") return tickets;
    if (activeView === "waiting") return tickets.filter(isWaitingTicket);
    return tickets.filter(isPendingTicket);
  }, [activeView, tickets]);

  const statusGroups = useMemo(() => {
    const groups = Array.from(groupTicketsByStatus(visibleTickets).values());
    if (activeView !== "all") return groups;
    return [...groups].sort((a, b) => statusOrderIndex(a.name) - statusOrderIndex(b.name));
  }, [visibleTickets, activeView]);

  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-none border border-slate-200 bg-[#f8fafc] shadow-sm">
      <header className="border-b border-[#0076e3] bg-white px-4 py-4 text-center">
        <h2 className="text-[15px] font-extrabold uppercase tracking-[.12em] text-[#0076e3]">Mis tickets</h2>
        <div className="mt-3 inline-flex gap-5" role="tablist" aria-label="Filtrar mis tickets">
          {TICKET_VIEWS.map(view => (
            <button
              key={view.id}
              type="button"
              role="tab"
              aria-selected={activeView === view.id}
              onClick={() => setActiveView(view.id)}
              className={`rounded-none border-b-2 bg-transparent px-1 pb-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0076e3] ${activeView === view.id ? "border-[#0076e3] text-[#0076e3]" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              {view.label}
            </button>
          ))}
        </div>
      </header>

      <div className="max-h-[610px] flex-1 space-y-4 overflow-y-auto p-3 sm:p-4">
        {loading && <p className="py-10 text-center text-sm text-slate-500">Cargando tus tickets…</p>}
        {!loading && error && <p role="alert" className="rounded-none bg-red-50 p-4 text-center text-sm text-red-700">{error}</p>}
        {!loading && !error && statusGroups.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <img src={sinBusquedaIcon} alt="" aria-hidden="true" className="h-20 w-20 object-contain" />
            <p className="text-sm text-slate-500">
              {activeView === "pending" && "No tienes tickets pendientes."}
              {activeView === "waiting" && "No tienes tickets en espera."}
              {activeView === "all" && "No tienes tickets asignados."}
            </p>
          </div>
        )}
        {!loading && !error && statusGroups.map(group => {
          const isOpen = !collapsedGroups.has(group.name);
          const panelId = `mis-tickets-grupo-${group.name.replace(/\s+/g, "-").toLowerCase()}`;
          return (
            <section key={group.name} aria-label={`Tickets en estado ${group.name}`}>
              <button
                type="button"
                onClick={() => toggleGroup(group.name)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="mb-2 flex w-full items-center justify-between gap-3 border-0 bg-transparent p-0 text-left"
              >
                <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-600">
                  <i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: group.color }} />
                  {group.name}
                </span>
                <span className="flex items-center gap-2">
                  <strong className="text-xs text-slate-400">{group.tickets.length}</strong>
                  <ChevronIcon open={isOpen} />
                </span>
              </button>
              {isOpen && (
                <div id={panelId} className="space-y-2">
                  {group.tickets.map(ticket => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      onViewTicket={viewTicketDetail}
                      onTakeTicket={takeAvailableTicket}
                      takingTicketId={takingTicketId}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </article>
  );
}
