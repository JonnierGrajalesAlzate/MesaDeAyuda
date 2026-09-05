import supabase from "../../config/supabaseClient.js";
import { enteroPositivo } from "../../utils/validation.js";
export const obtenerDashboardTecnico = async (req, res) => {
  try {
    const tecnico_id = enteroPositivo(req.params.tecnico_id);
    if (!tecnico_id) return res.status(400).json({ success: false, message: "Técnico no válido" });
    if (req.usuario.rol === "Tecnico" && tecnico_id !== req.usuario.id) {
      return res.status(403).json({ success: false, message: "No puedes consultar el panel de otro técnico" });
    }
    const { data, error } = await supabase.rpc("fn_dashboard_tecnico", { p_tecnico_id: tecnico_id });
    if (error) throw error;
    return res.status(200).json({ success: true, estadisticas: data.estadisticas, tickets: data.tickets });
  } catch (error) {
    console.error("Error obteniendo dashboard técnico:", error.message);
    return res.status(500).json({ success: false, message: "No se pudo obtener el dashboard del técnico" });
  }
};
