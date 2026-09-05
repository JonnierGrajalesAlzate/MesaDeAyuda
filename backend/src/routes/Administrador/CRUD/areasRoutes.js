import { Router } from "express";
import { autorizarRoles } from "../../../middleware/auth.js";
import { actualizarArea, crearArea, eliminarArea, listarAreas, listarUsuariosArea } from "../../../controllers/Administrador/CRUD/areasController.js";
import { emitirActividad } from "../../../services/realtimeService.js";
const router = Router();
router.use(autorizarRoles("Administrador"));
router.use((req, res, next) => {
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    res.once("finish", () => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        emitirActividad({
          recurso: "areas",
          accion: req.method.toLowerCase(),
          roles: ["Administrador"]
        });
      }
    });
  }
  next();
});
router.get("/", listarAreas);
router.get("/:id/usuarios", listarUsuariosArea);
router.post("/", crearArea);
router.put("/:id", actualizarArea);
router.delete("/:id", eliminarArea);
export default router;
