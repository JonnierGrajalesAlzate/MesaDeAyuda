// Las funciones RPC devuelven { success: false, message } sin código HTTP
// (no hay excepciones tipadas al otro lado de PostgREST). Esta heurística
// mapea el texto del mensaje al código HTTP que el endpoint original
// devolvía para el mismo caso, para no cambiar el contrato con el frontend.
export function estadoDesdeMensaje(mensaje) {
  const texto = String(mensaje || "");
  if (/no encontrad[oa]|no existe/i.test(texto)) return 404;
  if (/no est[aá]s autorizad[oa]|solo el|solo t[uú]|no puedes/i.test(texto)) return 403;
  return 409;
}
