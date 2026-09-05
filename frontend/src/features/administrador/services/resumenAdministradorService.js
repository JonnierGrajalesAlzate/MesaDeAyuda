import httpClient from "../../../shared/services/httpClient.js";
export const obtenerResumenAdministrador = async () => (await httpClient.get("/administrador/resumen")).data;
