import supabase from "../../../config/supabaseClient.js";
import { enteroPositivo } from "../../../utils/validation.js";
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ID_FILTERS = ["area", "tecnico", "categoria", "estado", "prioridad"];
function buildFiltros(query) {
  const startDate = typeof query.inicio === "string" && DATE_PATTERN.test(query.inicio) ? query.inicio : null;
  const endDate = typeof query.fin === "string" && DATE_PATTERN.test(query.fin) ? query.fin : null;
  const ids = Object.fromEntries(ID_FILTERS.map(key => {
    const rawValues = Array.isArray(query[key]) ? query[key] : String(query[key] || "").split(",");
    return [key, rawValues.filter(Boolean).map(enteroPositivo)];
  }));
  const invalid = query.inicio && !startDate
    || query.fin && !endDate
    || Object.entries(ids).some(([key, parsedValues]) => query[key] && parsedValues.some(value => !value));
  return {
    invalid,
    p_inicio: startDate,
    p_fin: endDate,
    p_area_ids: ids.area.length ? ids.area : null,
    p_tecnico_ids: ids.tecnico.length ? ids.tecnico : null,
    p_categoria_ids: ids.categoria.length ? ids.categoria : null,
    p_estado_ids: ids.estado.length ? ids.estado : null,
    p_prioridad_ids: ids.prioridad.length ? ids.prioridad : null
  };
}
export async function obtenerReportes(req, res) {
  try {
    const { invalid, ...parametros } = buildFiltros(req.query);
    if (invalid) {
      return res.status(400).json({ success: false, message: "Filtros de reporte no válidos" });
    }
    const { data, error } = await supabase.rpc("fn_reportes", parametros);
    if (error) throw error;
    return res.json({
      success: true,
      kpis: data.kpis,
      estados: data.estados,
      tecnicos: data.tecnicos,
      areas: data.areas,
      categorias: data.categorias,
      prioridades: data.prioridades,
      tendencia: data.tendencia,
      prediccion: data.prediccion,
      recientes: data.recientes
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Error generando reportes" });
  }
}
