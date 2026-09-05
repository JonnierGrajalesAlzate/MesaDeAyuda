import httpClient from "../../../../shared/services/httpClient.js";
const API_URL = "/estadisticas";
export const obtenerTicketsTecnico = async tecnicoId => {
  try {
    const {
      data
    } = await httpClient.get(`${API_URL}/tickets-tecnico/${tecnicoId}`);
    return data;
  } catch (error) {
    console.error("Error obteniendo los tickets del técnico:", error);
    throw error;
  }
};
