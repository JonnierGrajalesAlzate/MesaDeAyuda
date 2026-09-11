const UNIDADES = [
  { segundos: 31557600, singular: "año", plural: "años" },
  { segundos: 2629800, singular: "mes", plural: "meses" },
  { segundos: 604800, singular: "semana", plural: "semanas" },
  { segundos: 86400, singular: "día", plural: "días" },
  { segundos: 3600, singular: "hora", plural: "horas" },
  { segundos: 60, singular: "minuto", plural: "minutos" }
];

// Postgres devuelve "timestamp without time zone" como texto sin "Z" (ej. "2026-09-11T01:05:04").
// Sin marca de zona horaria, `new Date(...)` lo interpreta como hora LOCAL del navegador en vez
// de UTC, desfasando la fecha varias horas. Estos timestamps siempre son UTC, así que forzamos
// esa interpretación agregando la "Z" cuando el texto no trae ya una zona horaria.
export function aFechaUtc(fecha) {
  if (fecha instanceof Date) return fecha;
  const texto = String(fecha);
  const tieneZonaHoraria = /Z$|[+-]\d{2}:?\d{2}$/.test(texto);
  return new Date(tieneZonaHoraria ? texto : `${texto}Z`);
}

export function formatearTiempoRelativo(fecha) {
  const fechaObj = aFechaUtc(fecha);
  const segundos = Math.floor((Date.now() - fechaObj.getTime()) / 1000);
  if (segundos < 60) return "hace un momento";

  const unidad = UNIDADES.find(u => segundos >= u.segundos);
  const cantidad = Math.floor(segundos / unidad.segundos);
  return `hace ${cantidad} ${cantidad === 1 ? unidad.singular : unidad.plural}`;
}
