import express from "express";
import { Router } from "express";
import { buscarConocimiento } from "../../controllers/BaseConocimiento/index.js";
const router = Router();
router.get("/", buscarConocimiento);
export default router;
