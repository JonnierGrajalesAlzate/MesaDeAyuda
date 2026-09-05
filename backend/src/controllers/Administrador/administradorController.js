import supabase from "../../config/supabaseClient.js";
import { enteroPositivo, texto } from "../../utils/validation.js";
import { crearNotificacion } from "../../services/notificacionesService.js";
import { emitirActividad } from "../../services/realtimeService.js";
import { estadoDesdeMensaje } from "../../utils/rpcStatus.js";

function parseFilters(query) {
  const search = query.buscar ? texto(query.buscar, { max: 100 }) : null;
  const status = query.estado ? texto(query.estado, { max: 50 }) : null;
  const technician = query.tecnico ? enteroPositivo(query.tecnico) : null;
  const invalid = query.buscar && !search || query.estado && !status || query.tecnico && !technician;
  return { search, status, technician, invalid };
}

export async function obtenerTicketsAdministrador(req, res) {
  try {
    const filters = parseFilters(req.query);
    if (filters.invalid) {
      return res.status(400).json({ success: false, message: "Filtros no válidos" });
    }
    const [{ data: tickets, error: errorTickets }, { data: technicians, error: errorTec }, { data: statuses, error: errorEstados }] = await Promise.all([
      supabase.rpc("fn_admin_tickets", { p_search: filters.search, p_status: filters.status, p_technician: filters.technician }),
      supabase.from("usuarios").select("id,nombre,apellido,roles!inner(nombre)").eq("roles.nombre", "Tecnico").order("nombre"),
      supabase.from("estados").select("id,nombre,color").order("id")
    ]);
    if (errorTickets) throw errorTickets;
    if (errorTec) throw errorTec;
    if (errorEstados) throw errorEstados;
    return res.json({
      success: true,
      tickets,
      tecnicos: technicians.map(({ id, nombre, apellido }) => ({ id, nombre: `${nombre} ${apellido}` })),
      estados: statuses
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Error cargando el panel administrativo" });
  }
}

export async function obtenerResumenAdministrador(req, res) {
  try {
    const { data, error } = await supabase.rpc("fn_admin_resumen");
    if (error) throw error;
    return res.json({
      success: true,
      totales: data.totales,
      estados: data.estados,
      tecnicos: data.tecnicos,
      recientes: data.recientes
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Error cargando el resumen administrativo" });
  }
}

export async function obtenerTicketsPorEstado(req, res) {
  try {
    const estadoId = enteroPositivo(req.params.id);
    if (!estadoId) {
      return res.status(400).json({ success: false, message: "Estado no válido" });
    }
    const [{ data: estado, error: errorEstado }, { data: tickets, error: errorTickets }] = await Promise.all([
      supabase.from("estados").select("id,nombre,color").eq("id", estadoId).maybeSingle(),
      supabase.rpc("fn_admin_tickets_por_estado", { p_estado_id: estadoId })
    ]);
    if (errorEstado) throw errorEstado;
    if (errorTickets) throw errorTickets;
    if (!estado) {
      return res.status(404).json({ success: false, message: "El estado no existe" });
    }
    return res.json({ success: true, estado, tickets });
  } catch (error) {
    console.error("Error cargando tickets por estado:", error.message);
    return res.status(500).json({ success: false, message: "Error cargando los tickets del estado" });
  }
}

export async function obtenerTecnicosElegiblesTicket(req, res) {
  try {
    const ticketId = enteroPositivo(req.params.id);
    if (!ticketId) return res.status(400).json({ success: false, message: "Ticket no válido" });

    const { data: ticket, error: errorTicket } = await supabase.from("tickets").select("id,categoria_id,tecnico_id").eq("id", ticketId).maybeSingle();
    if (errorTicket) throw errorTicket;
    if (!ticket) return res.status(404).json({ success: false, message: "Ticket no encontrado" });

    const { data: tecnicos, error } = await supabase.rpc("fn_tecnicos_elegibles_ticket", { p_categoria_id: ticket.categoria_id });
    if (error) throw error;

    return res.json({ success: true, tecnico_actual_id: ticket.tecnico_id, tecnicos });
  } catch (error) {
    console.error("Error cargando técnicos elegibles:", error.message);
    return res.status(500).json({ success: false, message: "No se pudieron cargar los técnicos compatibles" });
  }
}

export async function reasignarTicket(req, res) {
  try {
    const ticketId = enteroPositivo(req.params.id);
    const tecnicoId = enteroPositivo(req.body?.tecnico_id);
    if (!ticketId || !tecnicoId) {
      return res.status(400).json({ success: false, message: "Ticket o técnico no válido" });
    }

    const { data: resultado, error } = await supabase.rpc("fn_reasignar_ticket_admin", {
      p_ticket_id: ticketId,
      p_tecnico_id: tecnicoId,
      p_actor_id: req.usuario.id
    });
    if (error) throw error;
    if (!resultado.success) {
      return res.status(estadoDesdeMensaje(resultado.message)).json({ success: false, message: resultado.message });
    }

    const ticketActual = resultado.ticket;
    const technicianName = resultado.tecnico_nombre;
    const assignedRole = resultado.tecnico_rol;
    const { data: actor } = await supabase.from("usuarios").select("nombre,apellido").eq("id", req.usuario.id).maybeSingle();
    const actorName = actor ? `${actor.nombre} ${actor.apellido}` : "Un administrador";
    const assignedTicketLink = assignedRole === "Administrador"
      ? `/administrador/tickets/${ticketId}?propio=1`
      : `/tecnico?ticket=${ticketId}`;
    const notifications = [];
    if (tecnicoId !== req.usuario.id) {
      notifications.push(crearNotificacion({
        usuarioId: tecnicoId,
        tipo: "TICKET_REASIGNADO",
        titulo: `${actorName} te ha reasignado el ticket #${ticketId}`,
        mensaje: ticketActual.titulo,
        enlace: assignedTicketLink
      }));
    }
    if (Number(ticketActual.usuario_id) !== req.usuario.id) {
      notifications.push(crearNotificacion({
        usuarioId: Number(ticketActual.usuario_id),
        tipo: "TICKET_REASIGNADO",
        titulo: `Ticket #${ticketId} reasignado`,
        mensaje: `Tu caso ahora está a cargo de ${technicianName}.`,
        enlace: `/tickets/${ticketId}`
      }));
    }
    if (ticketActual.tecnico_id_anterior && Number(ticketActual.tecnico_id_anterior) !== req.usuario.id) {
      notifications.push(crearNotificacion({
        usuarioId: Number(ticketActual.tecnico_id_anterior),
        tipo: "TICKET_REASIGNADO",
        titulo: `Ticket #${ticketId} reasignado`,
        mensaje: "El administrador asignó este caso a otro técnico.",
        enlace: "/tecnico"
      }));
    }
    Promise.all(notifications).catch(err => console.error("Error notificando reasignación:", err.message));
    emitirActividad({
      recurso: "tickets",
      accion: "reasignar",
      entidadId: ticketId,
      ticketId,
      usuarios: [ticketActual.usuario_id, ticketActual.tecnico_id_anterior, tecnicoId],
      roles: ["Administrador"]
    });

    return res.json({
      success: true,
      message: `Ticket reasignado a ${technicianName}`,
      ticket: { id: ticketId, tecnico_id: tecnicoId }
    });
  } catch (error) {
    console.error("Error reasignando ticket:", error.message);
    return res.status(500).json({ success: false, message: "No se pudo reasignar el ticket" });
  }
}
