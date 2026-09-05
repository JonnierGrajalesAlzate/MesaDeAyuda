import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/Dashboards/dashboardRoutes.js";
import noticiasRoutes from "./routes/Noticias/noticiasRoutes.js";
import ticketRoutes from "./routes/Tickets/ticketRoutes.js";
import catalogosRoutes from "./routes/Tickets/catalogosRoutes.js";
import comentarioRoutes from "./routes/Comentarios/comentarioRoutes.js";
import ticketEstadisticasRoutes from "./routes/Estadisticas/ticketEstadisticasRoutes.js";
import baseConocimientoRoutes from "./routes/BaseConocimiento/baseConocimientoRoutes.js";
import administradorRoutes from "./routes/Administrador/administradorRoutes.js";
import notificacionesRoutes from "./routes/Notificaciones/notificacionesRoutes.js";
import archivosRoutes from "./routes/archivosRoutes.js";
import ticketArchivoRoutes from "./routes/ticketArchivoRoutes.js";
import { autenticar } from "./middleware/auth.js";
import { cabecerasSeguras, limitarApi, manejarError, rutaNoEncontrada, validarOrigen } from "./middleware/security.js";
import { configuracionTrustProxy, origenPermitido } from "./config/security.js";
const app = express();
app.disable("x-powered-by");
app.set("trust proxy", configuracionTrustProxy());
app.set("query parser", "simple");
app.use(cabecerasSeguras);
app.use(cors({
  origin(origin, callback) {
    callback(null, !origin || origenPermitido(origin));
  },
  credentials: true,
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Accept"],
  maxAge: 600
}));
app.use(express.json({
  limit: "100kb",
  strict: true
}));
app.use(validarOrigen);
app.use("/api", limitarApi);
app.use("/api/auth", authRoutes);

// A partir de aquí toda la API y los archivos requieren una sesión válida.
app.use(autenticar);
app.use("/uploads", archivosRoutes);
app.use("/ticket", ticketArchivoRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/noticias", noticiasRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/catalogos", catalogosRoutes);
app.use("/api/comentarios", comentarioRoutes);
app.use("/api/estadisticas", ticketEstadisticasRoutes);
app.use("/api/base-conocimiento", baseConocimientoRoutes);
app.use("/api/administrador", administradorRoutes);
app.use("/api/notificaciones", notificacionesRoutes);
app.use(rutaNoEncontrada);
app.use(manejarError);
export default app;
