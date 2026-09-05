import abierto from "../../../../../assets/abierto.png";
import proceso from "../../../../../assets/proceso.png";
import enEspera from "../../../../../assets/enEspera.png";
import cerrado from "../../../../../assets/cerrado.png";
import reabierto from "../../../../../assets/Reabrir.png";
const cicloVidaData = [{
  titulo: "Abierto",
  descripcion: "Solicitud registrada.",
  icono: abierto
}, {
  titulo: "En Proceso",
  descripcion: "Un técnico la está gestionando.",
  icono: proceso
}, {
  titulo: "En Espera",
  descripcion: "Pendiente de información.",
  icono: enEspera
}, {
  titulo: "Cerrado",
  descripcion: "Incidente solucionado.",
  icono: cerrado
}, {
  titulo: "Reabierto",
  descripcion: "Requiere revisión adicional.",
  icono: reabierto
}];
export default cicloVidaData;
