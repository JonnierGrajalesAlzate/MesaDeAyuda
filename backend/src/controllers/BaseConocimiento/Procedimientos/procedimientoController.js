import supabase from "../../../config/supabaseClient.js";
import { esAdministrador } from "../../../services/accessControl.js";
import { enteroPositivo, texto, valorPermitido } from "../../../utils/validation.js";
const obtenerProcedimientos = async (req, res) => {
  try {
    const categoria = req.query.categoria ? enteroPositivo(req.query.categoria) : null;
    const estado = req.query.estado ? valorPermitido(req.query.estado, ["BORRADOR", "PUBLICADO", "ARCHIVADO"]) : null;
    const buscar = req.query.buscar ? texto(req.query.buscar, { max: 100 }) : null;
    const papelera = req.query.papelera === "true";
    if (req.query.categoria && !categoria || req.query.estado && !estado || req.query.buscar && !buscar) {
      return res.status(400).json({ success: false, message: "Filtros no válidos." });
    }

    let query = supabase
      .from("procedimientos")
      .select("id,titulo,descripcion,estado,version,vistas,activo,ticket_referencia_id,fecha_publicacion,fecha_actualizacion,categorias(id,nombre),usuarios(id,nombre,apellido)")
      .eq("activo", !papelera);

    if (papelera) {
      query = query.eq("autor_id", req.usuario.id);
    } else {
      if (!esAdministrador(req.usuario)) query = query.or(`estado.eq.PUBLICADO,autor_id.eq.${req.usuario.id}`);
      if (estado) query = query.eq("estado", estado);
    }
    if (categoria) query = query.eq("categoria_id", categoria);
    if (buscar) query = query.or(`titulo.ilike.%${buscar}%,descripcion.ilike.%${buscar}%,solucion.ilike.%${buscar}%`);
    query = query.order("fecha_actualizacion", { ascending: false }).order("fecha_publicacion", { ascending: false }).limit(500);

    const { data, error } = await query;
    if (error) throw error;

    const ids = data.map(fila => fila.id);
    const { data: archivos } = ids.length
      ? await supabase.from("procedimiento_archivos").select("procedimiento_id,nombre_original,tipo,es_principal,fecha_subida").in("procedimiento_id", ids)
      : { data: [] };
    const primerArchivoPorProcedimiento = new Map();
    for (const archivo of (archivos || []).sort((a, b) => (b.es_principal ? 1 : 0) - (a.es_principal ? 1 : 0) || new Date(a.fecha_subida) - new Date(b.fecha_subida))) {
      if (!primerArchivoPorProcedimiento.has(archivo.procedimiento_id)) primerArchivoPorProcedimiento.set(archivo.procedimiento_id, archivo);
    }

    const filas = data.map(({ categorias, usuarios, ...resto }) => {
      const archivo = primerArchivoPorProcedimiento.get(resto.id);
      return {
        ...resto,
        categoria_id: categorias?.id ?? null,
        categoria: categorias?.nombre ?? null,
        autor_id: usuarios?.id ?? null,
        autor: usuarios ? `${usuarios.nombre} ${usuarios.apellido}` : null,
        archivo_nombre: archivo?.nombre_original ?? null,
        archivo_tipo: archivo?.tipo ?? null
      };
    });

    return res.status(200).json({ success: true, procedimientos: filas });
  } catch (error) {
    console.error("Error obteniendo procedimientos:", error.message);
    return res.status(500).json({ success: false, message: "Error al obtener los procedimientos." });
  }
};
export { obtenerProcedimientos };
