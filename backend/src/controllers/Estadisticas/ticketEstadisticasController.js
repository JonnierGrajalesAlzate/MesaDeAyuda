import supabase from "../../config/supabaseClient.js";
import { enteroPositivo } from "../../utils/validation.js";
export const TodosTicketsTecnico = async (req, res) => {
  try {
    const tecnicoId = enteroPositivo(req.params.tecnicoId);
    if (!tecnicoId) return res.status(400).json({ message: "Técnico no válido" });
    if (req.usuario.rol === "Tecnico" && tecnicoId !== req.usuario.id) {
      return res.status(403).json({ message: "No puedes consultar las estadísticas de otro técnico" });
    }
    const { data, error } = await supabase.rpc("fn_tickets_estadisticas_tecnico", { p_tecnico_id: tecnicoId });
    if (error) throw error;
    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error obteniendo tickets del técnico" });
  }
};
