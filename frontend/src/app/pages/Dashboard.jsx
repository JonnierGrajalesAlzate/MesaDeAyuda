import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayoutUsuario.jsx";
import { obtenerDashboardUsuario } from "../../features/usuario/services/dashboardUsuarioService.js";
import { obtenerNoticias } from "../../features/noticias/services/noticiasService.js";
import { obtenerUltimosTickets } from "../../features/tickets/services/ticketService.js";
import useRealtimeRefresh from "../../shared/hooks/useRealtimeRefresh.js";
import PageLoader from "../../shared/ui/loading/PageLoader.jsx";
import ResponsiveTable from "../../shared/ui/ResponsiveTable.jsx";
import EstadoBadge from "../../features/usuario/components/VerTickets/EstadoBadge.jsx";
import PrioridadBadge from "../../features/usuario/components/VerTickets/PrioridadBadge.jsx";
import FechaTicket from "../../features/usuario/components/VerTickets/FechaTicket.jsx";
import EtiquetaBadge from "../../features/noticias/components/TablaNoticias/EtiquetaBadge.jsx";
import UserTicketSummary from "../../features/usuario/components/Dashboard/UserTicketSummary.jsx";
import crearIcon from "../../assets/CrearTicket.png";
import ticketsIcon from "../../assets/TicketsMenu.png";
import ayudaIcon from "../../assets/CentroAyuda.png";
const quickActions = [{
  title: "Crear ticket",
  description: "Registra un incidente o una nueva solicitud de soporte.",
  action: "Nueva solicitud",
  path: "/crear-ticket",
  icon: crearIcon,
  color: "#f4b400"
}, {
  title: "Mis solicitudes",
  description: "Consulta el estado, los mensajes y el historial de tus casos.",
  action: "Ver tickets",
  path: "/tickets",
  icon: ticketsIcon,
  color: "#5b21b6"
}, {
  title: "Centro de ayuda",
  description: "Encuentra guías, recomendaciones y preguntas frecuentes.",
  action: "Consultar ayuda",
  path: "/ayuda",
  icon: ayudaIcon,
  color: "#00a87f"
}];
function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const usuario = JSON.parse(localStorage.getItem("usuario")) || {};
  const [estadisticas, setEstadisticas] = useState({
    pendientes: 0,
    resueltos: 0,
    total: 0
  });
  const [ultimosTickets, setUltimosTickets] = useState([]);
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const cargarDashboard = useCallback(async () => {
    try {
      const [resumen, tickets, news] = await Promise.all([obtenerDashboardUsuario(usuario.id), obtenerUltimosTickets(usuario.id), obtenerNoticias()]);
      setEstadisticas({
        pendientes: Number(resumen.pendientes || 0),
        resueltos: Number(resumen.resueltos || 0),
        total: Number(resumen.total || 0)
      });
      setUltimosTickets(tickets);
      setNoticias(news);
    } catch (error) {
      console.error("No se pudo cargar el panel:", error);
    } finally {
      setLoading(false);
    }
  }, [usuario.id]);
  useEffect(() => {
    // Sincroniza la vista inicial con las fuentes remotas del panel.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarDashboard();
  }, [cargarDashboard]);
  useRealtimeRefresh(["tickets", "noticias"], cargarDashboard);
  useEffect(() => {
    if (loading || location.hash !== "#noticias") return undefined;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById("noticias")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [loading, location.hash, location.key]);
  if (loading) {
    return <PageLoader label="Cargando tu espacio de trabajo…" />;
  }

  return <DashboardLayout>
            <div className="space-y-6 user-dashboard">
                <section className=" grid gap-5 lg:h-80 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
                    <div className=" azure-panel flex h-full flex-col overflow-hidden p-6">
                        <span className=" azure-page-eyebrow">Resumen de tickets</span>
                        <div className=" mt-3 flex flex-1 flex-col items-center justify-center gap-8 md:flex-row">
                            <div className="flex-1 text-center">
                                <h1 className="text-3xl font-bold">Hola, {usuario.nombre || "usuario"}</h1>

                                <p className="mt-2 max-w-xl text-slate-500">
                                    Aquí tienes un resumen actualizado de la actividad de tus tickets.
                                </p>
                            </div>

                            <UserTicketSummary statistics={estadisticas} />
                        </div>
                    </div>

                    <aside id="noticias" className="azure-panel flex h-full scroll-mt-24 flex-col overflow-hidden">
                        <div className="azure-section-heading">
                            <div>
                                <span className="azure-page-eyebrow">Comunicados</span>
                            </div>
                            <span className="azure-count">{noticias.length}</span>
                        </div>
                        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
                            {noticias.length > 0 ? noticias.map(noticia => <article key={noticia.id} className="azure-news-item">
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="text-sm font-bold">{noticia.titulo}</h3>
                                        <EtiquetaBadge etiqueta={noticia.etiqueta} color={noticia.color} centrada={false} />
                                    </div>
                                    <p className="mt-2 line-clamp-3 text-sm text-slate-500">{noticia.descripcion}</p>
                                    <p className="mt-3 text-[11px] font-semibold text-slate-400">Publicado por Soporte LG</p>
                                </article>) : <p className="p-6 text-center text-slate-400">No hay noticias disponibles.</p>}
                        </div>
                    </aside>
                </section>

                <section>
                    <div className="mb-3 flex items-end justify-between">
                        <div>
                            <span className="azure-page-eyebrow">Accesos Rápidos</span> 
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        {quickActions.map(item => <button type="button" key={item.path} onClick={() => navigate(item.path)} className="azure-quick-action text-left" style={{
            "--action-color": item.color
          }}>
                                <span className="flex items-center justify-between gap-4">
                                    <span className="block text-base font-bold text-[#1e222b]">{item.title}</span>
                                    <img src={item.icon} alt="" className="h-16 w-16 shrink-0 object-contain" />
                                </span>
                                <span className="mt-1 block min-h-10 text-sm text-slate-500">{item.description}</span>
                                <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#0076e3]">
                                    {item.action} <span aria-hidden="true">→</span>
                                </span>
                            </button>)}
                    </div>
                </section>

                <section>
                    <div className="azure-panel overflow-hidden">
                        <div className="azure-section-heading">
                            <div>
                                <span className="azure-page-eyebrow">Actividad</span>
                                <h2 className="text-[14px] font-normal">Mis últimas solicitudes</h2>
                            </div>
                            <button type="button" onClick={() => navigate("/tickets")} className="azure-link-button">
                                Ver todas
                            </button>
                        </div>
                        <ResponsiveTable
                          minWidth={760}
                          ariaLabel="Solicitudes recientes con desplazamiento horizontal"
                          caption="Solicitudes recientes del usuario."
                        >
                                <thead>
                                    <tr className="text-slate-700">
                                        <th className="text-left p-3">ID</th>
                                        <th className="text-left p-3">Asunto</th>
                                        <th className="text-left p-3">Categoría</th>
                                        <th className="text-left p-3">Estado</th>
                                        <th className="text-left p-3">Prioridad</th>
                                        <th className="text-left p-3">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ultimosTickets.length > 0 ? ultimosTickets.map(ticket => <tr key={ticket.id} className="hover:bg-slate-100 transition duration-200">
                                            <td className="p-3 font-semibold text-slate-700">#{ticket.id}</td>
                                            <td className="p-3">
                                                <div className="truncate font-medium text-slate-800">{ticket.titulo}</div>
                                                <div className="mt-1 text-xs text-slate-400">{ticket.categoria}</div>
                                            </td>
                                            <td className="p-3 text-slate-700">{ticket.categoria}</td>
                                            <td className="p-3"><EstadoBadge estado={ticket.estado} color={ticket.color} /></td>
                                            <td className="p-3"><PrioridadBadge prioridad={ticket.prioridad} color={ticket.prioridad_color} /></td>
                                            <td className="whitespace-nowrap p-3"><FechaTicket fecha={ticket.fecha_creacion} /></td>
                                        </tr>) : <tr><td colSpan="6" className="p-10 text-center text-slate-400">Aún no hay tickets registrados.</td></tr>}
                                </tbody>
                        </ResponsiveTable>
                    </div>

                </section>
            </div>
        </DashboardLayout>;
}
export default Dashboard;
