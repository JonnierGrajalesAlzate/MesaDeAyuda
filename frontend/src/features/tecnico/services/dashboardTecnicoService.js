import httpClient from "../../../shared/services/httpClient.js";
const API_URL = "/dashboard";
export const obtenerDashboardTecnico = async tecnico_id => {
  try {
    const response = await httpClient.get(`${API_URL}/tecnico/${tecnico_id}`);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo dashboard:", error.response?.data || error.message);
    throw error;
  }
};
