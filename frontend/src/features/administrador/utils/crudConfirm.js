import alerta from "../../../shared/services/alertService.js";

export async function confirmAndDelete({ item, title, deleteFn, onDeleted }) {
  const confirmation = await alerta.fire({
    icon: "warning",
    title,
    text: item.nombre,
    showCancelButton: true,
    confirmButtonText: "Eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#dc2626"
  });
  if (!confirmation.isConfirmed) return false;

  try {
    const data = await deleteFn(item.id);
    await alerta.fire({
      icon: "success",
      title: data.message,
      timer: 1300,
      showConfirmButton: false
    });
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
}
