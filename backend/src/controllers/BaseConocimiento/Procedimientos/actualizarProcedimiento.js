import supabase from "../../../config/supabaseClient.js";
import { puedeModificarProcedimiento } from "../../../services/accessControl.js";
import { buscarProcedimiento } from "../../../services/procedimientosAccessService.js";
import { enteroPositivo, texto } from "../../../utils/validation.js";
const actualizarProcedimiento = async (req, res) => {
  try {
    const id = enteroPositivo(req.params.id);
    const titulo = texto(req.body?.titulo, { max: 180 });
    const descripcion = texto(req.body?.descripcion, { max: 5_000 });
    const solucion = texto(req.body?.solucion, { max: 5_000, optional: true });
    const notas = texto(req.body?.notas, { max: 5_000, optional: true });
    const categoriaId = enteroPositivo(req.body?.categoria_id);
    const rawTicketRef = req.body?.ticket_referencia_id;
    const ticketRefVacio = rawTicketRef === null || rawTicketRef === "" || rawTicketRef === undefined;
    const ticketReferenciaId = ticketRefVacio ? null : enteroPositivo(rawTicketRef);
    if (!id || !titulo || !descripcion || !categoriaId || !ticketRefVacio && !ticketReferenciaId) {
      return res.status(400).json({ success: false, message: "Los datos del procedimiento no son válidos." });
    }
    const procedimiento = await buscarProcedimiento(id);
    if (!procedimiento) return res.status(404).json({ success: false, message: "El procedimiento no existe." });
    if (!puedeModificarProcedimiento(req.usuario, procedimiento)) {
      return res.status(403).json({ success: false, message: "Solo el autor puede editar este procedimiento." });
    }
    const { data: categoria } = await supabase.from("categorias").select("id").eq("id", categoriaId).maybeSingle();
    if (!categoria) return res.status(404).json({ success: false, message: "La categoría seleccionada no existe." });
    if (ticketReferenciaId) {
      const { data: ticket } = await supabase.from("tickets").select("id").eq("id", ticketReferenciaId).maybeSingle();
      if (!ticket) return res.status(404).json({ success: false, message: "El ticket de referencia no existe." });
    }
    const { data, error } = await supabase
      .from("procedimientos")
      .update({
        titulo, descripcion, solucion, notas, categoria_id: categoriaId,
        ticket_referencia_id: ticketReferenciaId, version: (procedimiento.version || 1) + 1,
        fecha_actualizacion: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return res.status(200).json({ success: true, message: "Procedimiento actualizado correctamente.", procedimiento: data });
  } catch (error) {
    console.error("Error actualizando procedimiento:", error.message);
    return res.status(500).json({ success: false, message: "Ocurrió un error al actualizar el procedimiento." });
  }
};
export { actualizarProcedimiento };
