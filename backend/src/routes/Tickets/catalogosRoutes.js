import { Router } from "express";
import { obtenerCategorias, obtenerPrioridades, obtenerEstados, obtenerSubcategorias } from "../../controllers/Tickets/catalogosController.js";
const router = Router();
router.get("/categorias", obtenerCategorias);
router.get("/subcategorias", obtenerSubcategorias);
router.get("/prioridades", obtenerPrioridades);
router.get("/estados", obtenerEstados);
export default router;
