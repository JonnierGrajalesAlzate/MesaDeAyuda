import supabase from "../../config/supabaseClient.js";
import { enteroPositivo } from "../../utils/validation.js";
export const obtenerDashboardUsuario = async (req, res) => {
  try {
    const usuario_id = enteroPositivo(req.params.usuario_id);
    if (!usuario_id) return res.status(400).json({ success: false, message: "Usuario no válido" });
    if (req.usuario.rol === "Usuario" && usuario_id !== req.usuario.id) {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }
    const { data, error } = await supabase.rpc("fn_dashboard_usuario", { p_usuario_id: usuario_id });
    if (error) throw error;
    res.json({ success: true, pendientes: data.pendientes, resueltos: data.resueltos, total: data.total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error al obtener dashboard" });
  }
};
