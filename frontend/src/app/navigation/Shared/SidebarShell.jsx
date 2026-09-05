import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";

import cerrarSesionIcon from "../../../assets/cerrarSesion.png";
import logo from "../../../assets/logo2.png";
import useSecureLogout from "../../../shared/hooks/useSecureLogout.js";
import NavigationIcon from "./NavigationIcon.jsx";

function isMenuItemActive(pathname, menuItem) {
  const currentPath = pathname.toLowerCase();
  const menuPath = menuItem.path.toLowerCase();

  if (currentPath === menuPath) return true;
  return (menuItem.activePaths || []).some(path => currentPath.startsWith(path.toLowerCase()));
}

/**
 * Renderiza la estructura común de los menús laterales.
 * Cada rol aporta únicamente sus opciones; este componente concentra el
 * comportamiento responsive, el estado activo y el cierre seguro de sesión.
 */
export default function SidebarShell({ ariaLabel, menuItems, open, onClose }) {
  const location = useLocation();
  const { isLoggingOut, logout } = useSecureLogout();

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar menú lateral"
        className={`workspace-sidebar-overlay ${open ? "is-visible" : ""}`}
        onClick={onClose}
      />

      <aside className={`workspace-sidebar ${open ? "is-open" : ""}`}>
        <div className="workspace-brand">
          <img src={logo} alt="Logo de Soporte LG" className="workspace-brand-logo" />
          <div className="min-w-0">
            <strong>Soporte LG</strong>
            <span>Londoño Gómez</span>
          </div>
          <button
            type="button"
            aria-label="Cerrar menú"
            className="workspace-sidebar-close"
            onClick={onClose}
          >
            <X className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        <nav className="workspace-sidebar-nav" aria-label={ariaLabel}>
          {menuItems.map(menuItem => {
            const isActive = isMenuItemActive(location.pathname, menuItem);
            return (
              <Link
                key={menuItem.path}
                to={menuItem.path}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
                className={`workspace-sidebar-link ${isActive ? "is-active" : ""}`}
              >
                <span className="workspace-sidebar-link-icon">
                  {menuItem.iconSrc
                    ? <img src={menuItem.iconSrc} alt="" className="workspace-menu-image" />
                    : <NavigationIcon name={menuItem.icon} />}
                </span>
                <span>{menuItem.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="workspace-sidebar-footer">
          <button
            type="button"
            className="workspace-logout-button"
            onClick={logout}
            disabled={isLoggingOut}
            aria-label="Cerrar sesión de forma segura"
          >
            <img src={cerrarSesionIcon} alt="" />
            <span>{isLoggingOut ? "Cerrando sesión…" : "Cerrar sesión"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
