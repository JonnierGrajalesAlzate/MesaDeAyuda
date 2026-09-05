import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import useNotificaciones from "../../../features/notificaciones/hooks/useNotificaciones.js";
import useSecureLogout from "../../../shared/hooks/useSecureLogout.js";
import NotificationButton from "../../../features/notificaciones/components/NotificationButton.jsx";
import NotificationDropdown from "../../../features/notificaciones/components/NotificationDropdown.jsx";

const PAGE_LABELS = {
  Usuario: {
    "/dashboard": "Inicio",
    "/crear-ticket": "Crear ticket",
    "/tickets": "Mis tickets",
    "/ayuda": "Centro de ayuda"
  },
  "Técnico": {
    "/tecnico": "Inicio",
    "/estadisticas": "Estadísticas",
    "/noticias": "Noticias",
    "/baseconocimiento": "Base de conocimiento",
    "/baseconocimiento/crear-guia": "Nueva guía",
    "/baseconocimiento/editar-guia": "Editar guía"
  },
  Administrador: {
    "/administrador": "Inicio",
    "/administrador/noticias": "Noticias",
    "/reportes": "Reportes",
    "/usuarios": "Áreas | Usuarios | Categorías",
    "/administrador/base-conocimiento": "Base de conocimiento",
    "/administrador/base-conocimiento/crear-guia": "Nueva guía",
    "/administrador/base-conocimiento/editar-guia": "Editar guía"
  }
};

function resolvePageLabel(roleLabel, pathname) {
  const labels = PAGE_LABELS[roleLabel];
  if (!labels) return undefined;

  const path = pathname.toLowerCase();
  const matchedKey = Object.keys(labels)
    .filter(key => path === key || path.startsWith(`${key}/`))
    .sort((a, b) => b.length - a.length)[0];

  return matchedKey ? labels[matchedKey] : undefined;
}

function userInitials(user) {
  const names = [user.nombre, user.apellido].filter(Boolean);
  return names.length
    ? names.map(name => name.charAt(0).toUpperCase()).slice(0, 2).join("")
    : "U";
}

export default function WorkspaceTopbar({ onMenuToggle, roleLabel }) {
  const location = useLocation();
  const {
    notificaciones,
    noLeidas,
    notificacionesActivas,
    cargando,
    avisoNuevo,
    tieneNuevas,
    marcarVistas,
    leer,
    leerTodas,
    marcarNoLeida,
    eliminar,
    cambiarEstadoNotificaciones
  } = useNotificaciones();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const actionsRef = useRef(null);
  const { logout } = useSecureLogout();
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const fullName = [usuario.nombre, usuario.apellido].filter(Boolean).join(" ") || "Usuario";
  const currentPage = resolvePageLabel(roleLabel, location.pathname)
    || roleLabel
    || "Soporte LG";

  useEffect(() => {
    const closeDropdowns = event => {
      // El menú de opciones de cada notificación se renderiza en un portal fuera
      // de actionsRef, así que un clic dentro de él no debe cerrar el panel.
      if (event.target.closest?.("[data-notification-portal]")) return;

      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setUserMenuOpen(false);
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", closeDropdowns);
    return () => document.removeEventListener("mousedown", closeDropdowns);
  }, []);

  return (
    <header className="workspace-topbar">
      <div className="workspace-topbar-context">
        <button
          type="button"
          aria-label="Abrir menú lateral"
          className="workspace-menu-toggle"
          onClick={onMenuToggle}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <span className="azure-page-eyebrow workspace-topbar-eyebrow">
          {currentPage}
        </span>
      </div>

      <div ref={actionsRef} className="workspace-topbar-actions">
        <NotificationButton
          notificationOpen={notificationOpen}
          setNotificationOpen={setNotificationOpen}
          setUserMenuOpen={setUserMenuOpen}
          count={noLeidas}
          avisoNuevo={avisoNuevo}
          tieneNuevas={tieneNuevas}
          onOpen={marcarVistas}
        />

        <div className={`workspace-user-trigger ${userMenuOpen ? "is-open" : ""}`}>
          <button
            type="button"
            aria-label="Abrir opciones de la cuenta"
            aria-expanded={userMenuOpen}
            className="workspace-user-trigger-toggle"
            onClick={() => {
              setUserMenuOpen(current => !current);
              setNotificationOpen(false);
            }}
          >
            <span className="workspace-user-avatar">{userInitials(usuario)}</span>
            <span className="workspace-user-copy">
              <strong>{fullName}</strong>
              <small>{usuario.cargo || roleLabel || usuario.rol || "Cuenta"}</small>
            </span>
            <svg aria-hidden="true" viewBox="0 0 20 20" className="workspace-user-chevron">
              <path d="m6 8 4 4 4-4" />
            </svg>
          </button>

          {userMenuOpen && (
            <div className="workspace-user-logout-wrap">
              <button type="button" onClick={logout} className="workspace-user-logout-button">
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>

        <NotificationDropdown
          notificationOpen={notificationOpen}
          notificaciones={notificaciones}
          noLeidas={noLeidas}
          notificacionesActivas={notificacionesActivas}
          cargando={cargando}
          onLeer={leer}
          onLeerTodas={leerTodas}
          onMarcarNoLeida={marcarNoLeida}
          onEliminar={eliminar}
          onCambiarEstadoNotificaciones={cambiarEstadoNotificaciones}
          onClose={() => setNotificationOpen(false)}
          rol={usuario.rol}
        />
      </div>
    </header>
  );
}
