import axios from "axios";
import { limpiarDatosSesionCliente } from "./sessionCleanup.js";

// Punto único de configuración para que los servicios no dependan de localhost.
const configuredUrl = String(import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/$/, "");
export const API_BASE_URL = configuredUrl.endsWith("/api") ? configuredUrl : `${configuredUrl}/api`;
const resolvedApiUrl = new URL(API_BASE_URL, window.location.origin);
if (import.meta.env.PROD && resolvedApiUrl.protocol !== "https:") {
  throw new Error("VITE_API_URL debe usar HTTPS en producción");
}
export const API_ORIGIN = resolvedApiUrl.origin;
const httpClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000
});
httpClient.interceptors.response.use(response => response, error => {
  const isLogin = String(error.config?.url || "").includes("/auth/login");
  if (error.response?.status === 401 && !isLogin && window.location.pathname !== "/") {
    limpiarDatosSesionCliente();
    window.location.replace("/");
  }
  return Promise.reject(error);
});
export default httpClient;
