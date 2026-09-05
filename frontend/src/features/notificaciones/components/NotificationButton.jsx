import notificacion from "../../../assets/notificacion.png";
export default function NotificationButton({
  notificationOpen,
  setNotificationOpen,
  setUserMenuOpen,
  setMenuOpen = () => {},
  count = 0,
  avisoNuevo = 0,
  tieneNuevas = false,
  onOpen = () => {}
}) {
  // La key cambia con cada notificación entrante para que React remonte el
  // botón y las animaciones CSS (que corren al montar) se repitan cada vez.
  return <button
    key={avisoNuevo || "idle"}
    type="button"
    aria-label={`Notificaciones${count ? `, ${count} sin leer` : ""}`}
    onClick={() => {
      const abriendo = !notificationOpen;
      setNotificationOpen(abriendo);
      setUserMenuOpen(false);
      setMenuOpen(false);
      if (abriendo) onOpen();
    }}
    className={`relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition hover:opacity-80 ${avisoNuevo ? "notification-bell-pulse" : ""}`}
  >
    <img src={notificacion} alt="" className={`h-6 w-6 object-contain ${avisoNuevo ? "notification-bell-shake" : ""}`} />
    {tieneNuevas && <span className={`absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-[#0076e3] ring-2 ring-white ${avisoNuevo ? "notification-badge-pop" : ""}`} />}
  </button>;
}
