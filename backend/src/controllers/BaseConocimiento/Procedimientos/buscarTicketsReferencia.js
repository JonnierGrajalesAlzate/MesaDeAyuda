import supabase from "../../../config/supabaseClient.js";
import { esAdministrador } from "../../../services/accessControl.js";
import { texto } from "../../../utils/validation.js";
const buscarTicketsReferencia = async (req, res) => {
  try {
    const buscar = texto(req.query.buscar, { max: 100, optional: true }) || "";
    const { data, error } = await supabase.rpc("fn_buscar_tickets_referencia", {
      p_buscar: buscar || null,
      p_solo_tecnico_id: esAdministrador(req.usuario) ? null : req.usuario.id
    });
    if (error) throw error;
    return res.status(200).json({ success: true, tickets: data });
  } catch (error) {
    console.error("Error buscando tickets para referencia:", error.message);
    return res.status(500).json({ success: false, message: "Error al buscar tickets." });
  }
};
export { buscarTicketsReferencia };
