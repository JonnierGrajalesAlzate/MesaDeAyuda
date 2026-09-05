import httpClient from "./httpClient.js";
export const login = async (correo, password) => {
  const response = await httpClient.post("/auth/login", {
    correo,
    password
  });
  return response.data;
};
export const obtenerSesion = async () => (await httpClient.get("/auth/me")).data;
export const logout = async () => httpClient.post("/auth/logout");
