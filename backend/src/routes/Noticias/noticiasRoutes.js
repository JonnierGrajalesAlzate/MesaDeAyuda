import { Router } from "express";
import { autorizarRoles } from "../../middleware/auth.js";
import { emitirActividad } from "../../services/realtimeService.js";
import { obtenerNoticias, obtenerNoticiaPorId, crearNoticia, actualizarNoticia, eliminarNoticia, eliminarNoticiaDefinitivamente, cambiarEstadoNoticia, obtenerEtiquetas, obtenerEstadosNoticia } from "../../controllers/Noticias/noticiasController.js";
const router = Router();
router.use((req, res, next) => {
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    res.once("finish", () => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        emitirActividad({
          recurso: "noticias",
          accion: req.method.toLowerCase(),
          todos: true
        });
      }
    });
  }
  next();
});
router.get("/", obtenerNoticias);
router.get("/etiquetas", obtenerEtiquetas);
router.get("/estados", obtenerEstadosNoticia);
router.get("/:id", obtenerNoticiaPorId);
router.post("/", autorizarRoles("Tecnico", "Administrador"), crearNoticia);
router.put("/:id", autorizarRoles("Tecnico", "Administrador"), actualizarNoticia);
router.patch("/:id/estado", autorizarRoles("Tecnico", "Administrador"), cambiarEstadoNoticia);
router.delete("/:id/definitivo", autorizarRoles("Tecnico", "Administrador"), eliminarNoticiaDefinitivamente);
router.delete("/:id", autorizarRoles("Tecnico", "Administrador"), eliminarNoticia);
export default router;
