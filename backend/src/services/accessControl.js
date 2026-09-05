export function esAdministrador(usuario) {
  return usuario?.rol === "Administrador";
}
export function puedeAccederTicket(usuario, ticket) {
  if (!usuario || !ticket) return false;
  if (esAdministrador(usuario)) return true;
  if (usuario.rol === "Usuario") return Number(ticket.usuario_id) === Number(usuario.id);
  if (usuario.rol === "Tecnico") return Number(ticket.tecnico_id) === Number(usuario.id);
  return false;
}
export function puedeVerProcedimiento(usuario, procedimiento) {
  if (!usuario || !procedimiento || procedimiento.activo === false) return false;
  if (esAdministrador(usuario) || procedimiento.estado === "PUBLICADO") return true;
  return usuario.rol === "Tecnico" && Number(procedimiento.autor_id) === Number(usuario.id);
}
export function puedeModificarProcedimiento(usuario, procedimiento) {
  if (!usuario || !procedimiento || procedimiento.activo === false) return false;
  return esAdministrador(usuario) || usuario.rol === "Tecnico" && Number(procedimiento.autor_id) === Number(usuario.id);
}
