import httpClient from "../../../../shared/services/httpClient.js";
export const obtenerReportes = async (filtros = {}) => (await httpClient.get("/administrador/reportes", {
  params: Object.fromEntries(Object.entries(filtros).map(([key, value]) => [
    key,
    Array.isArray(value) ? value.join(",") : value
  ]))
})).data;
