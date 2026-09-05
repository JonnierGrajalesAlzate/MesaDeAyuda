import { useEffect, useState } from "react";

import { SESSION_STORAGE_KEY } from "../constants/auth.js";
import { obtenerSesion } from "../services/authService.js";
import { limpiarDatosSesionCliente } from "../services/sessionCleanup.js";
import { cerrarSesionSegura } from "../services/secureLogout.js";

const configuredIdleMinutes = Number(import.meta.env.VITE_SESSION_IDLE_MINUTES);
const SESSION_IDLE_MINUTES = Math.min(
  Math.max(Number.isFinite(configuredIdleMinutes) ? configuredIdleMinutes : 15, 5),
  60
);
const IDLE_TIMEOUT_MS = SESSION_IDLE_MINUTES * 60 * 1000;
const HEARTBEAT_INTERVAL_MS = 60 * 1000;
const USER_ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];

/**
 * Verifica y mantiene vigente la sesión usada por las rutas privadas.
 *
 * Además de validar inicialmente la cookie de sesión en el backend, controla
 * el cierre por inactividad, comprueba periódicamente que la sesión continúe
 * siendo válida y sincroniza cierres realizados en otras pestañas.
 *
 * @returns {{ loading: boolean, user: Object|null }} Estado actual de la sesión.
 */
export default function useProtectedSession() {
  const [session, setSession] = useState({ loading: true, user: null });

  useEffect(() => {
    let isMounted = true;

    obtenerSesion()
      .then(({ usuario }) => {
        if (!isMounted) return;
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(usuario));
        window.dispatchEvent(new Event("soportelg:auth"));
        setSession({ loading: false, user: usuario });
      })
      .catch(() => {
        if (!isMounted) return;
        limpiarDatosSesionCliente();
        setSession({ loading: false, user: null });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!session.user) return undefined;

    let idleTimer;
    let lastHeartbeat = Date.now();
    let isHeartbeatRunning = false;

    const closeExpiredSession = () => cerrarSesionSegura({ force: true });

    const verifySessionIfNecessary = async () => {
      const now = Date.now();
      if (isHeartbeatRunning || now - lastHeartbeat < HEARTBEAT_INTERVAL_MS) return;

      isHeartbeatRunning = true;
      lastHeartbeat = now;
      try {
        await obtenerSesion();
      } catch {
        await closeExpiredSession();
      } finally {
        isHeartbeatRunning = false;
      }
    };

    const registerUserActivity = () => {
      clearTimeout(idleTimer);
      idleTimer = window.setTimeout(closeExpiredSession, IDLE_TIMEOUT_MS);
      verifySessionIfNecessary();
    };

    USER_ACTIVITY_EVENTS.forEach(eventName => {
      window.addEventListener(eventName, registerUserActivity, { passive: true });
    });
    document.addEventListener("visibilitychange", registerUserActivity);
    registerUserActivity();

    return () => {
      clearTimeout(idleTimer);
      USER_ACTIVITY_EVENTS.forEach(eventName => {
        window.removeEventListener(eventName, registerUserActivity);
      });
      document.removeEventListener("visibilitychange", registerUserActivity);
    };
  }, [session.user]);

  useEffect(() => {
    const synchronizeClosedSession = () => {
      if (localStorage.getItem(SESSION_STORAGE_KEY)) return;
      setSession({ loading: false, user: null });
    };

    const synchronizeStorageChange = event => {
      if (event.key === SESSION_STORAGE_KEY || event.key === null) {
        synchronizeClosedSession();
      }
    };

    const synchronizeRestoredPage = event => {
      if (event.persisted) synchronizeClosedSession();
    };

    window.addEventListener("soportelg:auth", synchronizeClosedSession);
    window.addEventListener("storage", synchronizeStorageChange);
    window.addEventListener("pageshow", synchronizeRestoredPage);

    return () => {
      window.removeEventListener("soportelg:auth", synchronizeClosedSession);
      window.removeEventListener("storage", synchronizeStorageChange);
      window.removeEventListener("pageshow", synchronizeRestoredPage);
    };
  }, []);

  return session;
}
