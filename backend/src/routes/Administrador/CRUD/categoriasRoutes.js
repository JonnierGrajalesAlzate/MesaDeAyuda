import { Router } from "express";
import { autorizarRoles } from "../../../middleware/auth.js";
import { actualizarCategoria, crearCategoria, eliminarCategoria, listarCategorias } from "../../../controllers/Administrador/CRUD/categoriasController.js";
import { actualizarSubcategoria, crearSubcategoria, eliminarSubcategoria, listarSubcategoriasPorCategoria } from "../../../controllers/Administrador/CRUD/subcategoriasController.js";
import { emitirActividad } from "../../../services/realtimeService.js";
const router = Router();
router.use(autorizarRoles("Administrador"));
router.use((req, res, next) => {
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    res.once("finish", () => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        emitirActividad({
          recurso: "categorias",
          accion: req.method.toLowerCase(),
          roles: ["Administrador"]
        });
      }
    });
  }
  next();
});
router.get("/", listarCategorias);
router.post("/", crearCategoria);
router.put("/:id", actualizarCategoria);
router.delete("/:id", eliminarCategoria);
router.get("/:categoriaId/subcategorias", listarSubcategoriasPorCategoria);
router.post("/:categoriaId/subcategorias", crearSubcategoria);
router.put("/subcategorias/:id", actualizarSubcategoria);
router.delete("/subcategorias/:id", eliminarSubcategoria);
export default router;
