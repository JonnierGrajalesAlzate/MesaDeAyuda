export const USER_ROLES = Object.freeze({
  ADMINISTRATOR: "Administrador",
  TECHNICIAN: "Tecnico",
  USER: "Usuario"
});

export const ROLE_HOME_PATHS = Object.freeze({
  [USER_ROLES.ADMINISTRATOR]: "/administrador",
  [USER_ROLES.TECHNICIAN]: "/tecnico",
  [USER_ROLES.USER]: "/dashboard"
});

export const SESSION_STORAGE_KEY = "usuario";

/**
 * Devuelve la página principal habilitada para un rol autenticado.
 * Los roles desconocidos se envían al inicio del usuario y luego serán
 * validados nuevamente por la protección de rutas.
 */
export function getHomePathForRole(role) {
  return ROLE_HOME_PATHS[role] || ROLE_HOME_PATHS[USER_ROLES.USER];
}
