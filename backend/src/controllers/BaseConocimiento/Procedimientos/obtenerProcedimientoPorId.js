import supabase from "../../../config/supabaseClient.js";
import { puedeVerProcedimiento } from "../../../services/accessControl.js";
import { enteroPositivo } from "../../../utils/validation.js";
const obtenerProcedimientoPorId = async (req, res) => {
  try {
    const id = enteroPositivo(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Procedimiento no válido." });
    const { data: fila, error } = await supabase
      .from("procedimientos")
      .select("*, categorias(nombre), usuarios(nombre,apellido)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!fila) return res.status(404).json({ success: false, message: "Procedimiento no encontrado." });

    const { categorias, usuarios, ...procedimiento } = fila;
    procedimiento.categoria = categorias?.nombre ?? null;
    procedimiento.autor = usuarios ? `${usuarios.nombre} ${usuarios.apellido}` : null;

    const puedeVer = procedimiento.activo
      ? puedeVerProcedimiento(req.usuario, procedimiento)
      : req.usuario?.rol === "Administrador" || Number(procedimiento.autor_id) === Number(req.usuario?.id);
    if (!puedeVer) {
      return res.status(403).json({ success: false, message: "No tienes acceso a este procedimiento." });
    }

    const [{ data: archivos }, { data: ticketReferencia }, { data: notas }] = await Promise.all([
      supabase.from("procedimiento_archivos")
        .select("id,nombre,nombre_original,tipo,tipo_recurso,tamano,descripcion,es_principal,fecha_subida")
        .eq("procedimiento_id", id)
        .order("es_principal", { ascending: false })
        .order("fecha_subida", { ascending: true }),
      procedimiento.ticket_referencia_id
        ? supabase.from("tickets")
          .select("id,titulo,descripcion,fecha_creacion,categoria_id,categorias(nombre),prioridades(nombre,color),usuarios!usuario_id(nombre,apellido)")
          .eq("id", procedimiento.ticket_referencia_id)
          .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase.from("procedimiento_notas")
        .select("id,nota,fecha_creacion,usuarios(nombre,apellido)")
        .eq("procedimiento_id", id)
        .order("fecha_creacion", { ascending: false })
    ]);

    const ticketReferenciaPlano = ticketReferencia ? {
      id: ticketReferencia.id, titulo: ticketReferencia.titulo, descripcion: ticketReferencia.descripcion,
      fecha_creacion: ticketReferencia.fecha_creacion,
      categoria_id: ticketReferencia.categoria_id ?? null,
      categoria: ticketReferencia.categorias?.nombre ?? null,
      prioridad: ticketReferencia.prioridades?.nombre ?? null,
      prioridad_color: ticketReferencia.prioridades?.color ?? null,
      usuario: ticketReferencia.usuarios ? `${ticketReferencia.usuarios.nombre} ${ticketReferencia.usuarios.apellido}` : null
    } : null;

    const notasAdicionales = (notas || []).map(({ usuarios: autorUsuario, ...resto }) => ({
      ...resto,
      autor: autorUsuario ? `${autorUsuario.nombre} ${autorUsuario.apellido}` : null
    }));

    return res.status(200).json({
      success: true,
      procedimiento,
      archivos: archivos || [],
      ticket_referencia: ticketReferenciaPlano,
      notas_adicionales: notasAdicionales
    });
  } catch (error) {
    console.error("Error obteniendo procedimiento:", error.message);
    return res.status(500).json({ success: false, message: "Error al obtener el procedimiento." });
  }
};
export { obtenerProcedimientoPorId };
