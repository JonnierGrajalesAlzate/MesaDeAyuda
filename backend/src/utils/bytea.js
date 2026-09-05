// PostgREST serializa el body como JSON, así que un Buffer de Node no puede
// insertarse tal cual en una columna bytea (se convertiría en {type:"Buffer",
// data:[...]}, no en un valor bytea válido). Hay que codificarlo como texto
// en el formato hexadecimal que Postgres entiende: \x<hex>.
export function bufferABytea(buffer) {
  return `\\x${Buffer.from(buffer).toString("hex")}`;
}

// PostgREST devuelve las columnas bytea como texto hexadecimal (\x...);
// hay que decodificarlas de vuelta a Buffer antes de enviarlas como
// respuesta binaria (descarga de archivos, adjuntos, etc.).
export function byteaABuffer(valor) {
  if (valor === null || valor === undefined) return null;
  if (Buffer.isBuffer(valor)) return valor;
  const texto = String(valor);
  return Buffer.from(texto.startsWith("\\x") ? texto.slice(2) : texto, "hex");
}
