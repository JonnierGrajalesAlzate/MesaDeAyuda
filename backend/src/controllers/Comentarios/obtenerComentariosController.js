import supabase from "../../config/supabaseClient.js";
import { puedeAccederTicket } from "../../services/accessControl.js";
import { enteroPositivo } from "../../utils/validation.js";
export const obtenerComentarios = async (req, res) => {
  try {
    const ticket_id = enteroPositivo(req.params.ticket_id);
    if (!ticket_id) return res.status(400).json({ success: false, message: "Ticket no válido." });
    const { data: ticket } = await supabase.from("tickets").select("usuario_id,tecnico_id").eq("id", ticket_id).maybeSingle();
    if (!ticket) return res.status(404).json({ success: false, message: "Ticket no encontrado." });
    if (!puedeAccederTicket(req.usuario, ticket)) {
      return res.status(403).json({ success: false, message: "No tienes acceso a este ticket." });
    }
    const { data, error } = await supabase
      .from("comentarios")
      .select("id,comentario,fecha,usuario_id,usuarios(nombre,apellido,rol_id)")
      .eq("ticket_id", ticket_id)
      .order("fecha", { ascending: true });
    if (error) throw error;
    const comentarios = data.map(({ usuarios, ...resto }) => ({
      ...resto,
      nombre: usuarios?.nombre ?? null,
      apellido: usuarios?.apellido ?? null,
      rol_id: usuarios?.rol_id ?? null
    }));
    res.json({ success: true, comentarios });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error obteniendo los comentarios." });
  }
};
