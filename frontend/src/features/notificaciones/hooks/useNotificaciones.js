import { useCallback, useEffect, useRef, useState } from "react";
import socket from "../../../shared/realtime/socket.js";
import { playNotificationSound } from "../../../shared/services/notificationSound.js";
import {
  actualizarPreferenciasNotificaciones,
  eliminarNotificacion,
  marcarNotificacionLeida,
  marcarNotificacionNoLeida,
  marcarNotificacionesLeidas,
  obtenerNotificaciones
} from "../services/notificacionesService.js";
export default function useNotificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [notificacionesActivas, setNotificacionesActivas] = useState(true);
  const [cargando, setCargando] = useState(true);
  // Se incrementa cada vez que llega una notificación por socket, para que la
  // campana pueda animarse aunque el contador de no leídas ya sea alto.
  const [avisoNuevo, setAvisoNuevo] = useState(0);
  // Indica si hay notificaciones que el usuario aún no ha "visto" (no abrió
  // el panel desde que llegaron). El punto de la campana se guía por esto,
  // no por noLeidas, para que desaparezca al abrir el panel.
  const [tieneNuevas, setTieneNuevas] = useState(false);
  const notificacionesActivasRef = useRef(true);
  useEffect(() => {
    notificacionesActivasRef.current = notificacionesActivas;
  }, [notificacionesActivas]);
  const cargar = useCallback(async () => {
    try {
      const data = await obtenerNotificaciones();
      setNotificaciones(data.notificaciones || []);
      const nuevoTotal = data.no_leidas || 0;
      setNoLeidas(prev => {
        if (nuevoTotal > prev) setTieneNuevas(true);
        return nuevoTotal;
      });
      setNotificacionesActivas(data.activas !== false);
    } catch (error) {
      console.error("No se pudieron cargar las notificaciones", error);
    } finally {
      setCargando(false);
    }
  }, []);
  const marcarVistas = useCallback(() => setTieneNuevas(false), []);
  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
    if (!usuario?.id) return undefined;
    // Sincroniza el centro de notificaciones al montar la barra autenticada.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar();
    if (!socket.connected) socket.connect();
    const recibir = notificacion => {
      setNotificaciones(prev => [notificacion, ...prev.filter(item => item.id !== notificacion.id)].slice(0, 30));
      setNoLeidas(prev => prev + 1);
      if (notificacionesActivasRef.current) {
        playNotificationSound();
        setAvisoNuevo(valor => valor + 1);
        setTieneNuevas(true);
      }
    };
    socket.on("NOTIFICACION_NUEVA", recibir);
    const intervalo = window.setInterval(cargar, 60000);
    return () => {
      socket.off("NOTIFICACION_NUEVA", recibir);
      window.clearInterval(intervalo);
    };
  }, [cargar]);
  const leer = async notificacion => {
    if (!notificacion.leida) {
      setNotificaciones(prev => prev.map(item => item.id === notificacion.id ? {
        ...item,
        leida: true
      } : item));
      setNoLeidas(prev => Math.max(0, prev - 1));
      await marcarNotificacionLeida(notificacion.id).catch(cargar);
    }
  };
  const leerTodas = async () => {
    setNotificaciones(prev => prev.map(item => ({
      ...item,
      leida: true
    })));
    setNoLeidas(0);
    await marcarNotificacionesLeidas().catch(cargar);
  };
  const marcarNoLeida = async notificacion => {
    if (!notificacion.leida) return;
    setNotificaciones(prev => prev.map(item => item.id === notificacion.id ? {
      ...item,
      leida: false
    } : item));
    setNoLeidas(prev => prev + 1);
    await marcarNotificacionNoLeida(notificacion.id).catch(cargar);
  };
  const eliminar = async notificacion => {
    setNotificaciones(prev => prev.filter(item => item.id !== notificacion.id));
    if (!notificacion.leida) {
      setNoLeidas(prev => Math.max(0, prev - 1));
    }
    await eliminarNotificacion(notificacion.id).catch(cargar);
  };
  const cambiarEstadoNotificaciones = async activas => {
    const estadoAnterior = notificacionesActivas;
    setNotificacionesActivas(activas);
    try {
      await actualizarPreferenciasNotificaciones(activas);
    } catch (error) {
      setNotificacionesActivas(estadoAnterior);
      throw error;
    }
  };
  return {
    notificaciones,
    noLeidas,
    notificacionesActivas,
    cargando,
    avisoNuevo,
    tieneNuevas,
    marcarVistas,
    cargar,
    leer,
    leerTodas,
    marcarNoLeida,
    eliminar,
    cambiarEstadoNotificaciones
  };
}
