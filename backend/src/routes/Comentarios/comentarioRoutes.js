import { Router } from "express";
import { crearComentario } from "../../controllers/Comentarios/crearComentarioController.js";
import { obtenerComentarios } from "../../controllers/Comentarios/obtenerComentariosController.js";
const router = Router();
router.get("/:ticket_id", obtenerComentarios);
router.post("/", crearComentario);
export default router;
