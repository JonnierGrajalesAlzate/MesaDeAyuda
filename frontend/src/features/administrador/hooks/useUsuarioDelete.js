import { useState } from "react";
import alerta from "../../../shared/services/alertService.js";
import { eliminarUsuario, obtenerTransferenciaPendiente } from "../services/CRUD/usuariosService.js";

export default function useUsuarioDelete(onDeleted) {
  const [deleteTransfer, setDeleteTransfer] = useState(null);
  const [transferSaving, setTransferSaving] = useState(false);

  const executeDelete = async (user, technicianId) => {
    try {
      const data = await eliminarUsuario(user.id, technicianId);
      await alerta.fire({
        icon: "success",
        title: data.message,
        timer: 1300,
        showConfirmButton: false
      });
      setDeleteTransfer(null);
      await onDeleted?.();
      return true;
    } catch (error) {
      alerta.fire({
        icon: "error",
        title: "No se pudo eliminar",
        text: error.response?.data?.message
      });
      return false;
    }
  };

  const remove = async user => {
    try {
      const plan = await obtenerTransferenciaPendiente(user.id);
      if (plan.total > 0) {
        setDeleteTransfer({ usuario: user, plan });
        return false;
      }
    } catch (error) {
      await alerta.fire({
        icon: "error",
        title: "No se pudo revisar la carga pendiente",
        text: error.response?.data?.message || "Intenta nuevamente."
      });
      return false;
    }

    const confirmation = await alerta.fire({
      icon: "warning",
      title: "¿Eliminar usuario?",
      text: `${user.nombre} ${user.apellido}`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626"
    });
    if (!confirmation.isConfirmed) return false;
    return executeDelete(user);
  };

  const confirmDeleteTransfer = async technicianId => {
    if (!deleteTransfer) return;
    setTransferSaving(true);
    try {
      await executeDelete(deleteTransfer.usuario, technicianId);
    } finally {
      setTransferSaving(false);
    }
  };

  return {
    remove,
    deleteTransfer,
    transferSaving,
    confirmDeleteTransfer,
    closeTransfer: () => setDeleteTransfer(null)
  };
}
