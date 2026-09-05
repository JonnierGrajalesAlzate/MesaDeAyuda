import supabase from "../../config/supabaseClient.js";
import { crearNotificacion, notificarRol } from "../../services/notificacionesService.js";
import { emitirActividad } from "../../services/realtimeService.js";
import { puedeAccederTicket } from "../../services/accessControl.js";
import { enteroPositivo, texto } from "../../utils/validation.js";
import { bufferABytea } from "../../utils/bytea.js";

const TICKET_SELECT = `
  id, usuario_id, tecnico_id, titulo, descripcion, estado_id, prioridad_id, categoria_id,
  fecha_creacion, fecha_cierre,
  estados(nombre, color),
  prioridades(nombre, color),
  categorias(nombre),
  usuario:usuarios!usuario_id(nombre, apellido),
  tecnico:usuarios!tecnico_id(nombre, apellido)
`;

function aplanarTicket(fila) {
  if (!fila) return fila;
  const { estados, prioridades, categorias, usuario, tecnico, ...resto } = fila;
  return {
    ...resto,
    estado: estados?.nombre ?? null,
    color: estados?.color ?? null,
    prioridad: prioridades?.nombre ?? null,
    prioridad_color: prioridades?.color ?? null,
    categoria: categorias?.nombre ?? null,
    usuario: usuario ? `${usuario.nombre} ${usuario.apellido}` : null,
    tecnico: tecnico ? `${tecnico.nombre} ${tecnico.apellido}` : "Sin asignar"
  };
}

export const crearTicket = async (req, res) => {
  try {
    const titulo = texto(req.body?.titulo, { max: 160 });
    const descripcion = texto(req.body?.descripcion, { max: 5_000 });
    const categoria_id = enteroPositivo(req.body?.categoria_id);
    const subcategoria_id = req.body?.subcategoria_id ? enteroPositivo(req.body?.subcategoria_id) : null;
    const usuario_id = req.usuario.rol === "Usuario" ? req.usuario.id : enteroPositivo(req.body?.usuario_id);
    const esCritico = ["true", "1", "on"].includes(String(req.body?.es_critico).toLowerCase());

    if (!titulo || !descripcion || !categoria_id || !usuario_id) {
      return res.status(400).json({ success: false, message: "Todos los campos son obligatorios" });
    }

    const { data: resultado, error } = await supabase.rpc("fn_crear_ticket", {
      p_titulo: titulo,
      p_descripcion: descripcion,
      p_categoria_id: categoria_id,
      p_subcategoria_id: subcategoria_id,
      p_usuario_id: usuario_id,
      p_es_critico: esCritico
    });
    if (error) throw error;
    if (!resultado.success) {
      return res.status(400).json({ success: false, message: resultado.message });
    }
    const ticket = resultado.ticket;

    if (req.file) {
      await supabase.from("archivos_adjuntos").insert({
        ticket_id: ticket.id,
        nombre_archivo: req.file.originalname,
        ruta_archivo: req.file.filename,
        tipo: req.file.mimetype,
        contenido: bufferABytea(req.file.buffer)
      });
    }

    const { data: usuarioActor } = await supabase.from("usuarios").select("nombre,apellido").eq("id", usuario_id).maybeSingle();
    const usuarioNombre = usuarioActor ? `${usuarioActor.nombre} ${usuarioActor.apellido}` : "Un usuario";

    const avisos = [crearNotificacion({
      usuarioId: Number(usuario_id),
      tipo: "TICKET_CREADO",
      titulo: `Ticket #${ticket.id} creado`,
      mensaje: ticket.estado_id === 1 ? "Tu ticket fue creado y asignado correctamente." : "Tu ticket fue creado y quedó en espera de asignación.",
      enlace: `/tickets/${ticket.id}`
    })];
    if (ticket.tecnico_id) {
      if (Number(ticket.tecnico_id) !== Number(req.usuario.id)) {
        avisos.push(crearNotificacion({
          usuarioId: Number(ticket.tecnico_id),
          tipo: "TICKET_ASIGNADO",
          titulo: `${usuarioNombre} creó el ticket #${ticket.id}`,
          mensaje: titulo,
          enlace: `/tecnico?ticket=${ticket.id}`
        }));
      }
    } else {
      avisos.push(notificarRol("Tecnico", {
        tipo: "TICKET_EN_ESPERA",
        titulo: `${usuarioNombre} creó el ticket #${ticket.id} en espera`,
        mensaje: titulo,
        enlace: `/tecnico?ticket=${ticket.id}`
      }, req.usuario.id));
    }
    Promise.all(avisos).catch(err => console.error("Error enviando notificaciones:", err));
    emitirActividad({
      recurso: "tickets",
      accion: "crear",
      entidadId: ticket.id,
      ticketId: ticket.id,
      usuarios: [usuario_id, ticket.tecnico_id],
      roles: ticket.tecnico_id ? ["Administrador"] : ["Tecnico", "Administrador"]
    });
    return res.status(201).json({
      success: true,
      message: ticket.estado_id === 1 ? "Su Ticket fue creado correctamente." : "Su ticket quedó EN ESPERA.",
      ticket
    });
  } catch (error) {
    console.error("Error creando ticket:", error.message);
    return res.status(500).json({ success: false, message: "No se pudo crear el ticket" });
  }
};

export const obtenerUltimosTickets = async (req, res) => {
  try {
    const usuarioId = enteroPositivo(req.params.usuarioId);
    if (!usuarioId) return res.status(400).json({ message: "Usuario no válido" });
    if (req.usuario.rol === "Usuario" && usuarioId !== req.usuario.id) return res.status(403).json({ message: "No autorizado" });
    const { data, error } = await supabase
      .from("tickets")
      .select(`id, usuario_id, tecnico_id, titulo, fecha_creacion, categorias(nombre), estados(nombre,color), prioridades(nombre,color)`)
      .eq("usuario_id", usuarioId)
      .order("fecha_creacion", { ascending: false })
      .limit(3);
    if (error) throw error;
    res.json(data.map(fila => {
      const { categorias, estados, prioridades, ...resto } = fila;
      return {
        ...resto,
        categoria: categorias?.nombre ?? null,
        estado: estados?.nombre ?? null,
        color: estados?.color ?? null,
        prioridad: prioridades?.nombre ?? null,
        prioridad_color: prioridades?.color ?? null
      };
    }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo tickets" });
  }
};

export const TodosTickets = async (req, res) => {
  try {
    const usuarioId = enteroPositivo(req.params.usuarioId);
    if (!usuarioId) return res.status(400).json({ message: "Usuario no válido" });
    if (req.usuario.rol === "Usuario" && usuarioId !== req.usuario.id) return res.status(403).json({ message: "No autorizado" });
    const { data, error } = await supabase.rpc("fn_tickets_todos_usuario", { p_usuario_id: usuarioId });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo tickets" });
  }
};

export const InfoTicket = async (req, res) => {
  try {
    const ticketId = enteroPositivo(req.params.ticketId);
    if (!ticketId) return res.status(400).json({ mensaje: "Ticket no válido" });
    const { data, error } = await supabase.from("tickets").select(TICKET_SELECT).eq("id", ticketId).maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ mensaje: "Ticket no encontrado" });
    const ticket = aplanarTicket(data);
    if (!puedeAccederTicket(req.usuario, ticket)) {
      return res.status(403).json({ mensaje: "No tienes acceso a este ticket" });
    }
    res.json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener ticket" });
  }
};

export const obtenerDetalleTicket = async (req, res) => {
  try {
    const id = enteroPositivo(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Ticket no válido" });
    const { data: ticket, error } = await supabase.rpc("fn_ticket_detalle", { p_id: id });
    if (error) throw error;
    if (!ticket) return res.status(404).json({ success: false, message: "Ticket no encontrado" });
    if (!puedeAccederTicket(req.usuario, ticket)) {
      return res.status(403).json({ success: false, message: "No tienes acceso a este ticket" });
    }
    return res.status(200).json({ success: true, ticket });
  } catch (error) {
    console.error("Error obteniendo detalle de ticket:", error.message);
    return res.status(500).json({ success: false, message: "No se pudo obtener el ticket" });
  }
};
