import { Router } from "express";
import { autorizarRoles } from "../../../middleware/auth.js";
import { actualizarUsuario, catalogosUsuarios, crearUsuario, eliminarUsuario, listarUsuarios, obtenerTransferenciaUsuario } from "../../../controllers/Administrador/CRUD/usuariosController.js";
import { emitirActividad } from "../../../services/realtimeService.js";
const router = Router();
router.use(autorizarRoles("Administrador"));
router.use((req, res, next) => {
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    res.once("finish", () => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        emitirActividad({
          recurso: "usuarios",
          accion: req.method.toLowerCase(),
          roles: ["Administrador"]
        });
      }
    });
  }
  next();
});
router.get("/catalogos", catalogosUsuarios);
router.get("/:id/transferencia-pendientes", obtenerTransferenciaUsuario);
router.get("/", listarUsuarios);
router.post("/", crearUsuario);
router.put("/:id", actualizarUsuario);
router.delete("/:id", eliminarUsuario);
export default router;
