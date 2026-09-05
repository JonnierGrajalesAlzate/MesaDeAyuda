import supabase from "../config/supabaseClient.js";
export async function buscarProcedimiento(id) {
  const { data, error } = await supabase
    .from("procedimientos")
    .select("id,autor_id,estado,activo,version")
    .eq("id", id)
    .eq("activo", true)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}
export async function buscarProcedimientoPorArchivo(archivoId) {
  const { data, error } = await supabase
    .from("procedimiento_archivos")
    .select("id,procedimientos!inner(id,autor_id,estado,activo)")
    .eq("id", archivoId)
    .eq("procedimientos.activo", true)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { ...data.procedimientos, archivo_id: data.id };
}
