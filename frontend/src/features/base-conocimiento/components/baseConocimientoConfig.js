export const EMPTY_ARTICLE = {
  titulo: "",
  descripcion: "",
  solucion: "",
  notas: "",
  categoria_id: "",
  ticket_referencia_id: ""
};
export function getStatusTone(status) {
  if (status === "PUBLICADO") return "green";
  if (status === "ARCHIVADO") return "red";
  return "amber";
}
