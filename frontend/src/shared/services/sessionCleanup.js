export function limpiarDatosSesionCliente() {
  try {
    localStorage.clear();
  } catch {
    // El cierre continúa aunque el navegador restrinja el almacenamiento.
  }

  try {
    sessionStorage.clear();
  } catch {
    // El cierre continúa aunque el navegador restrinja el almacenamiento.
  }

  window.name = "";
  window.dispatchEvent(new Event("soportelg:auth"));
}
