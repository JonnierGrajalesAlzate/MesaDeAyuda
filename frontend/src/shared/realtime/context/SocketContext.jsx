import { useEffect, useState } from "react";
import socket from "../socket.js";
import SocketContext from "./socketContext.js";

function tieneUsuario() {
  try {
    return Boolean(JSON.parse(localStorage.getItem("usuario") || "null")?.id);
  } catch {
    return false;
  }
}

function SocketProvider({
  children
}) {
  const [conectado, setConectado] = useState(socket.connected);
  useEffect(() => {
    const onConnect = () => setConectado(true);
    const onDisconnect = () => setConectado(false);
    const syncAuthentication = () => {
      if (tieneUsuario()) {
        if (!socket.connected) socket.connect();
      } else {
        socket.disconnect();
        setConectado(false);
      }
    };
    const onStorage = event => {
      if (event.key === "usuario") syncAuthentication();
    };
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onDisconnect);
    window.addEventListener("storage", onStorage);
    window.addEventListener("soportelg:auth", syncAuthentication);
    syncAuthentication();
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onDisconnect);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("soportelg:auth", syncAuthentication);
      socket.disconnect();
    };
  }, []);
  return <SocketContext.Provider value={{
    socket,
    conectado
  }}>
      {children}
    </SocketContext.Provider>;
}
export default SocketProvider;
