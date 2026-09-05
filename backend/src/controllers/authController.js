import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import supabase from "../config/supabaseClient.js";
import { COOKIE_NAME, JWT_ALGORITHM, JWT_AUDIENCE, JWT_ISSUER, SESSION_ABSOLUTE_TIMEOUT_MS, obtenerJwtSecret, opcionesBorrarCookieSesion, opcionesCookieSesion } from "../config/security.js";
import { crearSesion, revocarSesion } from "../services/sessionService.js";
const DUMMY_BCRYPT_HASH = "$2b$12$C6UzMDM.H6dfI/f/IKcEe.3V7S6Xh7q4Yq1QWmP5xZ7lJ9gT2O3K2";
const BCRYPT_PATTERN = /^\$2[aby]\$\d{2}\$/;
export const login = async (req, res) => {
  try {
    const correo = String(req.body?.correo || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    // La política de longitud se aplica al crear o cambiar contraseñas.
    // En login se permiten credenciales heredadas para poder migrarlas a bcrypt.
    if (correo.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) || password.length < 1 || password.length > 128 || Buffer.byteLength(password, "utf8") > 72) {
      return res.status(401).json({ success: false, message: "Credenciales incorrectas" });
    }
    const { data: usuario } = await supabase.rpc("fn_buscar_usuario_login", { p_correo: correo });
    // Ejecutar bcrypt incluso si el usuario no existe reduce diferencias de tiempo.
    const passwordGuardado = typeof usuario?.password === "string" ? usuario.password : "";
    const esHashBcrypt = BCRYPT_PATTERN.test(passwordGuardado);
    const hashComparacion = esHashBcrypt ? usuario.password : DUMMY_BCRYPT_HASH;
    let passwordValido = await bcrypt.compare(password, hashComparacion);

    // Migración transparente y temporal de contraseñas heredadas en texto plano.
    if (usuario && !esHashBcrypt && passwordGuardado === password) {
      passwordValido = true;
      const nuevoHash = await bcrypt.hash(password, 12);
      await supabase.from("usuarios").update({ password: nuevoHash }).eq("id", usuario.id);
    }
    if (!usuario || !passwordValido) {
      return res.status(401).json({ success: false, message: "Credenciales incorrectas" });
    }
    if (usuario.estado === "Desactivado") {
      return res.status(403).json({ success: false, message: "Tu cuenta está desactivada. Comunícate con el administrador." });
    }
    const session = crearSesion(usuario.id, usuario.rol);
    let token;
    try {
      token = jwt.sign({
        sub: String(usuario.id),
        rol: usuario.rol
      }, obtenerJwtSecret(), {
        jwtid: session.jti,
        expiresIn: Math.floor(SESSION_ABSOLUTE_TIMEOUT_MS / 1000),
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
        algorithm: JWT_ALGORITHM
      });
    } catch (error) {
      revocarSesion(session.jti);
      throw error;
    }
    delete usuario.password;
    res.cookie(COOKIE_NAME, token, opcionesCookieSesion());
    return res.status(200).json({ success: true, usuario });
  } catch (error) {
    console.error("Error de autenticación:", error.message);
    return res.status(500).json({ success: false, message: "Error interno" });
  }
};
export const sesionActual = async (req, res) => {
  try {
    const { data: fila } = await supabase
      .from("usuarios")
      .select("id,nombre,apellido,correo,cargo,estado,roles(nombre)")
      .eq("id", req.usuario.id)
      .maybeSingle();
    const usuario = fila ? { ...fila, rol: fila.roles?.nombre } : null;
    if (usuario) delete usuario.roles;
    if (!usuario || usuario.rol !== req.usuario.rol || usuario.estado === "Desactivado") {
      revocarSesion(req.sesion.jti);
      res.clearCookie(COOKIE_NAME, opcionesBorrarCookieSesion());
      return res.status(401).json({ message: "Sesión inválida" });
    }
    return res.json({ usuario });
  } catch (error) {
    console.error("Error consultando la sesión:", error.message);
    return res.status(500).json({ message: "No se pudo validar la sesión" });
  }
};
export const logout = (req, res) => {
  revocarSesion(req.sesion?.jti);
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.clearCookie(COOKIE_NAME, opcionesBorrarCookieSesion());
  return res.status(204).end();
};
