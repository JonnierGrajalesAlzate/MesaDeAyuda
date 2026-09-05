import alerta from "../../../../shared/services/alertService.js";

//==========================
// Noticia creada
//==========================

export const alertaNoticiaCreada = () => {
  return alerta.fire({
    icon: "success",
    title: "Noticia creada",
    timer: 1800,
    showConfirmButton: false
  });
};

//==========================
// Noticia actualizada
//==========================

export const alertaNoticiaActualizada = () => {
  return alerta.fire({
    icon: "success",
    title: "Noticia actualizada",
    timer: 1800,
    showConfirmButton: false
  });
};

//==========================
// Error al guardar
//==========================

export const alertaErrorGuardar = () => {
  return alerta.fire({
    icon: "error",
    title: "Error",
    text: "No fue posible guardar."
  });
};

//==========================
// Confirmar eliminación
//==========================

export const confirmarEliminarNoticia = titulo => {
  return alerta.fire({
    title: "¿Eliminar noticia?",
    text: titulo,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#64748b"
  });
};

//==========================
// Eliminada correctamente
//==========================

export const alertaNoticiaEliminada = () => {
  return alerta.fire({
    icon: "success",
    title: "Eliminada",
    timer: 1800,
    showConfirmButton: false
  });
};
