import procedimientosRoutes from "./procedimientosRoutes.js";
import archivosRoutes from "./archivosRoutes.js";
import busquedaRoutes from "./busquedaRoutes.js";
import { Router } from "express";
import { autorizarRoles } from "../../middleware/auth.js";
import { emitirActividad } from "../../services/realtimeService.js";
const router = Router();
router.use(autorizarRoles("Tecnico", "Administrador"));
router.use((req, res, next) => {
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method) && !req.path.endsWith("/vista")) {
    res.once("finish", () => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        emitirActividad({
          recurso: "base-conocimiento",
          accion: req.method.toLowerCase(),
          roles: ["Tecnico", "Administrador"]
        });
      }
    });
  }
  next();
});
router.use("/procedimientos", procedimientosRoutes);
router.use("/archivos", archivosRoutes);
router.use("/busqueda", busquedaRoutes);
export default router;
