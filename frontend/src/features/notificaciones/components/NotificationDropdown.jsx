import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { BellOff, EllipsisVertical, Mail, MailOpen, Trash2, X } from "lucide-react";
import alerta from "../../../shared/services/alertService.js";

const ITEM_MENU_WIDTH = 264;
const ITEM_MENU_HEIGHT = 200;
const ITEM_MENU_GAP = 6;

function relativeTime(date) {
  const timestamp = new Date(date).getTime();
  if (!Number.isFinite(timestamp)) return "";

  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60_000));
  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `Hace ${days} d`;

  return new Date(timestamp).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
  });
}

function notificationDestination(notification, role) {
  try {
    if (role === "Usuario" && notification.tipo === "NUEVA_NOTICIA") {
      const destination = new URL(
        notification.enlace || "/Noticias",
        window.location.origin,
      );
      const newsId = destination.searchParams.get("noticia");
      return `/dashboard${newsId ? `?noticia=${encodeURIComponent(newsId)}` : ""}#noticias`;
    }

    if (role === "Administrador" && typeof notification.enlace === "string") {
      const destination = new URL(notification.enlace, window.location.origin);
      const pathname = destination.pathname.toLowerCase();

      if (pathname === "/noticias") {
        return `/administrador/noticias${destination.search}${destination.hash}`;
      }

      if (pathname === "/baseconocimiento") {
        return `/administrador/base-conocimiento${destination.search}${destination.hash}`;
      }
    }
  } catch {
    return undefined;
  }

  return notification.enlace;
}

function NotificationLoading() {
  return (
    <div className="space-y-1 p-2" aria-label="Cargando notificaciones">
      {[0, 1, 2].map((item) => (
        <div key={item} className="flex animate-pulse gap-3 px-2 py-2.5">
          <span className="h-9 w-9 shrink-0 rounded-full bg-slate-200" />
          <span className="flex-1">
            <span className="block h-2.5 w-3/5 rounded bg-slate-200" />
            <span className="mt-2.5 block h-2 w-full rounded bg-slate-100" />
            <span className="mt-1.5 block h-2 w-4/5 rounded bg-slate-100" />
          </span>
        </div>
      ))}
    </div>
  );
}

function NotificationEmpty() {
  return (
    <div className="flex flex-col items-center justify-center gap-1 px-8 py-10 text-center">
      <h4 className="text-sm font-bold text-[#1e222b]">Todo está al día</h4>
      <p className="max-w-64 text-xs leading-5 text-slate-500">
        La actividad de tus tickets y las novedades de SoporteLG aparecerán aquí.
      </p>
    </div>
  );
}

function NotificationItemMenu({
  notification,
  notificacionesActivas,
  onLeer,
  onMarcarNoLeida,
  onEliminar,
  onChangeNotificationsState,
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: ITEM_MENU_WIDTH });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const close = () => setOpen(false);

  const toggle = event => {
    event.stopPropagation();
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const width = Math.min(ITEM_MENU_WIDTH, window.innerWidth * 0.82);
      const left = Math.min(Math.max(12, rect.right - width), window.innerWidth - width - 12);
      const openUp = window.innerHeight - rect.bottom < ITEM_MENU_HEIGHT + ITEM_MENU_GAP;
      const top = openUp ? Math.max(12, rect.top - ITEM_MENU_HEIGHT - ITEM_MENU_GAP) : rect.bottom + ITEM_MENU_GAP;
      setPosition({ top, left, width });
    }
    setOpen(value => !value);
  };

  useEffect(() => {
    if (!open) return undefined;
    const closeOutside = event => {
      if (!buttonRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) close();
    };
    document.addEventListener("pointerdown", closeOutside);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open]);

  const run = action => {
    close();
    action();
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Más opciones para: ${notification.titulo}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0076e3] ${
          open
            ? "bg-slate-100"
            : "opacity-100 hover:bg-slate-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
        }`}
      >
        <EllipsisVertical className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          role="menu"
          data-notification-portal=""
          aria-label={`Opciones de la notificación ${notification.titulo}`}
          className="fixed z-[999999] overflow-hidden rounded-lg border border-slate-200 bg-white p-1.5 shadow-[0_16px_40px_rgba(30,34,43,0.2)]"
          style={{ top: position.top, left: position.left, width: position.width }}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => run(() => (notification.leida ? onMarcarNoLeida(notification) : onLeer(notification)))}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            {notification.leida
              ? <Mail className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
              : <MailOpen className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />}
            <span>{notification.leida ? "Marcar como no leído" : "Marcar como leído"}</span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => run(() => onEliminar(notification))}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] font-medium text-slate-700 transition-colors hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
            <span>Eliminar</span>
          </button>

          {notificacionesActivas && (
            <>
              <div className="my-1 border-t border-slate-100" />

              <button
                type="button"
                role="menuitem"
                onClick={() => run(() => onChangeNotificationsState(false))}
                className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] font-medium text-slate-700 transition-colors hover:bg-amber-50 hover:text-amber-800"
              >
                <BellOff className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                <span>Desactivar todas las notificaciones</span>
              </button>
            </>
          )}
        </div>,
        document.body,
      )}
    </>
  );
}

export default function NotificationDropdown({
  notificationOpen,
  notificaciones,
  noLeidas,
  notificacionesActivas,
  cargando,
  onLeer,
  onLeerTodas,
  onMarcarNoLeida,
  onEliminar,
  onCambiarEstadoNotificaciones,
  onClose,
  rol,
}) {
  const navigate = useNavigate();

  if (!notificationOpen) return null;

  const openNotification = (notification) => {
    onLeer(notification);
    onClose();

    const destination = notificationDestination(notification, rol);
    const isInternalPath = typeof destination === "string"
      && destination.startsWith("/")
      && !destination.startsWith("//");

    if (isInternalPath) {
      navigate(destination, {
        state: {
          desdeNotificacion: notification.id,
        },
      });
    }
  };

  const changeNotificationsState = async (activas) => {
    if (!activas) {
      const result = await alerta.fire({
        icon: "warning",
        title: "¿Desactivar las notificaciones?",
        text: "No recibirás nuevas notificaciones hasta que vuelvas a activarlas.",
        showCancelButton: true,
        confirmButtonText: "Desactivar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#dc2626"
      });

      if (!result.isConfirmed) return;
    }

    try {
      await onCambiarEstadoNotificaciones(activas);
      alerta.fire({
        icon: "success",
        title: activas
          ? "Notificaciones activadas"
          : "Notificaciones desactivadas",
        text: activas
          ? "Volverás a recibir toda la actividad de SoporteLG."
          : "Puedes volver a activarlas desde este mismo panel."
      });
    } catch {
      alerta.fire({
        icon: "error",
        title: "No se pudo actualizar la configuración",
        text: "Verifica tu conexión e inténtalo nuevamente."
      });
    }
  };

  return (
    <section
      role="dialog"
      aria-label="Centro de notificaciones"
      className="absolute right-0 top-14 z-[99999] flex max-h-[min(75vh,460px)] w-[min(24rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
    >
      <header className="shrink-0 border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-[#1e222b]">Notificaciones</h3>

          <button
            type="button"
            aria-label="Cerrar notificaciones"
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-slate-100"
          >
            <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            {noLeidas > 0 ? `${noLeidas} sin leer` : "Estás al día"}
          </span>

          {noLeidas > 0 && (
            <button
              type="button"
              onClick={onLeerTodas}
              className="text-xs font-semibold text-[#0076e3] transition-colors hover:text-[#005fbd] hover:underline"
            >
              Marcar todas como leídas
            </button>
          )}
        </div>
      </header>

      {!notificacionesActivas && (
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-2">
          <span className="text-xs font-medium text-[#0076e3]">Notificaciones desactivadas</span>
          <button
            type="button"
            onClick={() => changeNotificationsState(true)}
            className="shrink-0 rounded-none bg-[#0076e3] px-2.5 py-1 text-xs font-bold text-white transition-colors hover:bg-[#005fbd]"
          >
            Activar
          </button>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {cargando ? (
          <NotificationLoading />
        ) : notificaciones.length === 0 ? (
          <NotificationEmpty />
        ) : (
          <div className="divide-y divide-slate-100">
            {notificaciones.map((notification) => {
              return (
                <article
                  key={notification.id}
                  className={`group relative flex gap-3 px-4 py-3 transition-colors ${
                    notification.leida ? "hover:bg-slate-50" : "bg-[#f2f8ff] hover:bg-[#e9f3ff]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => openNotification(notification)}
                    className="flex min-w-0 flex-1 gap-3 text-left"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <strong
                          className={`flex min-w-0 items-center gap-1.5 truncate text-[13px] leading-5 text-[#1e222b] ${
                            notification.leida ? "font-medium" : "font-bold"
                          }`}
                        >
                          {!notification.leida && (
                            <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#0076e3]" />
                          )}
                          <span className="truncate">{notification.titulo}</span>
                        </strong>

                        <time
                          dateTime={notification.fecha_creacion}
                          className="shrink-0 pt-0.5 text-[11px] text-slate-400"
                        >
                          {relativeTime(notification.fecha_creacion)}
                        </time>
                      </span>

                      <span className="mt-0.5 block line-clamp-2 text-xs leading-5 text-slate-500">
                        {notification.mensaje}
                      </span>
                    </span>
                  </button>

                  <div className="flex shrink-0 items-start pt-0.5">
                    <NotificationItemMenu
                      notification={notification}
                      notificacionesActivas={notificacionesActivas}
                      onLeer={onLeer}
                      onMarcarNoLeida={onMarcarNoLeida}
                      onEliminar={onEliminar}
                      onChangeNotificationsState={changeNotificationsState}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
