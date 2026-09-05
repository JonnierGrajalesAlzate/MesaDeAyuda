import bcrypt from "bcryptjs";
import supabase from "../../../config/supabaseClient.js";
import { revocarSesionesUsuario } from "../../../services/sessionService.js";
import { enteroPositivo, texto } from "../../../utils/validation.js";
import { desconectarConexionesUsuario, usuarioEstaEnLinea } from "../../../services/userPresenceService.js";
import { crearNotificacion } from "../../../services/notificacionesService.js";
import { emitirActividad } from "../../../services/realtimeService.js";
const ESTADOS_USUARIO = new Set(["Activo", "Desactivado"]);
const ROLES_RESPONSABLES = new Set(["Tecnico", "Administrador"]);

function idsCategorias(value) {
  if (!Array.isArray(value) || value.length > 100) return null;
  const ids = value.map(enteroPositivo);
  if (ids.some(id => !id)) return null;
  return [...new Set(ids)];
}

async function sincronizarCategorias(usuarioId, rolId, categorias) {
  const { data: rol } = await supabase.from("roles").select("nombre").eq("id", rolId).maybeSingle();
  if (!rol) return { valid: false, message: "El rol seleccionado no existe" };

  const isResponsible = ROLES_RESPONSABLES.has(rol.nombre);
  if (isResponsible && (!categorias || categorias.length === 0)) {
    return { valid: false, message: "Selecciona al menos una categoría para este responsable" };
  }

  if (categorias?.length) {
    const { data: existentes } = await supabase.from("categorias").select("id").in("id", categorias);
    if ((existentes?.length || 0) !== categorias.length) {
      return { valid: false, message: "Una o más categorías no existen" };
    }
  }

  await supabase.from("categorias_tecnicos").delete().eq("tecnico_id", usuarioId);
  if (isResponsible) {
    await supabase.from("categorias_tecnicos").insert(categorias.map(categoria_id => ({ tecnico_id: usuarioId, categoria_id })));
  }
  return { valid: true };
}
function correoValido(value) {
  const correo = texto(value, { max: 254 });
  return correo && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) ? correo.toLowerCase() : null;
}
function passwordValido(password) {
  return password.length >= 8 && password.length <= 128 && Buffer.byteLength(password, "utf8") <= 72;
}
function datosUsuario(body, { requirePassword = false } = {}) {
  const password = typeof body?.password === "string" ? body.password : "";
  const data = {
    nombre: texto(body?.nombre, { max: 100 }),
    apellido: texto(body?.apellido, { max: 100 }),
    cargo: texto(body?.cargo, { max: 120, optional: true }),
    correo: correoValido(body?.correo),
    password,
    rolId: enteroPositivo(body?.rol_id),
    areaId: enteroPositivo(body?.area_id),
    estado: texto(body?.estado, { max: 20 }) || "Activo"
  };
  const cumplePassword = !password || passwordValido(password);
  return data.nombre && data.apellido && data.correo && data.rolId && data.areaId && ESTADOS_USUARIO.has(data.estado) && cumplePassword && (!requirePassword || password) ? data : null;
}
export async function listarUsuarios(_req, res) {
  try {
    const { data, error } = await supabase.rpc("fn_usuarios_listado");
    if (error) throw error;
    return res.json({
      success: true,
      usuarios: data.map(usuario => {
        const enLinea = usuario.estado !== "Desactivado" && usuarioEstaEnLinea(usuario.id);
        return {
          ...usuario,
          en_linea: enLinea,
          presencia: usuario.estado === "Desactivado" ? "Desactivado" : enLinea ? "En línea" : "Fuera de línea"
        };
      })
    });
  } catch (error) {
    console.error("Error cargando usuarios:", error.message);
    return res.status(500).json({ success: false, message: "Error cargando usuarios" });
  }
}
export async function catalogosUsuarios(_req, res) {
  try {
    const [{ data: roles, error: e1 }, { data: areas, error: e2 }, { data: categories, error: e3 }] = await Promise.all([
      supabase.from("roles").select("id,nombre").order("id"),
      supabase.from("areas").select("id,nombre").order("nombre"),
      supabase.from("categorias").select("id,nombre").order("nombre")
    ]);
    if (e1 || e2 || e3) throw e1 || e2 || e3;
    return res.json({ success: true, roles, areas, categorias: categories });
  } catch (error) {
    console.error("Error cargando catálogos de usuarios:", error.message);
    return res.status(500).json({ success: false, message: "Error cargando catálogos" });
  }
}
export async function obtenerTransferenciaUsuario(req, res) {
  try {
    const id = enteroPositivo(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Usuario no válido" });
    const { data: existe } = await supabase.from("usuarios").select("id").eq("id", id).maybeSingle();
    if (!existe) return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    const { data: plan, error } = await supabase.rpc("fn_plan_transferencia_usuario", { p_usuario_id: id });
    if (error) throw error;
    return res.json({ success: true, ...plan });
  } catch (error) {
    console.error("Error consultando transferencia:", error.message);
    return res.status(500).json({ success: false, message: "No se pudo preparar la transferencia" });
  }
}

function notificarTransferencia(transferencia, origen, actorId) {
  if (!transferencia?.tickets?.length || !transferencia.tecnico) return;
  const total = transferencia.tickets.length;
  if (Number(transferencia.tecnico.id) !== Number(actorId)) {
    crearNotificacion({
      usuarioId: Number(transferencia.tecnico.id),
      tipo: "TICKETS_TRANSFERIDOS",
      titulo: `${total} ticket${total === 1 ? "" : "s"} transferido${total === 1 ? "" : "s"}`,
      mensaje: `Los casos pendientes de ${origen} fueron trasladados a tu cuenta. Revisa su estado y prioridad.`,
      enlace: "/tecnico"
    }).catch(error => console.error("Error notificando transferencia:", error));
  }

  for (const ticket of transferencia.tickets) {
    if (Number(ticket.usuario_id) === Number(actorId)) continue;
    crearNotificacion({
      usuarioId: Number(ticket.usuario_id),
      tipo: "RESPONSABLE_CAMBIADO",
      titulo: `Nuevo responsable para tu ticket #${ticket.id}`,
      mensaje: "Tu solicitud fue trasladada a otro integrante del equipo de soporte para garantizar su continuidad.",
      enlace: `/tickets/${ticket.id}`
    }).catch(error => console.error("Error notificando cambio de responsable:", error));
  }

  emitirActividad({
    recurso: "tickets",
    accion: "transferir",
    usuarios: [transferencia.tecnico.id, ...transferencia.tickets.map(ticket => ticket.usuario_id)],
    roles: ["Administrador", "Tecnico"]
  });
}

async function transferirTicketsPendientesSiAplica(usuarioId, transferirAId) {
  const { data: resultado, error } = await supabase.rpc("fn_transferir_tickets_pendientes", {
    p_origen_id: usuarioId,
    p_destino_id: transferirAId ? enteroPositivo(transferirAId) : null
  });
  if (error) throw error;
  return resultado;
}

export async function crearUsuario(req, res) {
  try {
    const data = datosUsuario(req.body, { requirePassword: true });
    if (!data) return res.status(400).json({
      success: false,
      message: "Los datos del usuario no son válidos; la contraseña debe tener al menos 8 caracteres y no superar 72 bytes"
    });
    const categorias = idsCategorias(req.body?.categoria_ids);
    if (!categorias) return res.status(400).json({ success: false, message: "Las categorías seleccionadas no son válidas" });

    const { data: rol } = await supabase.from("roles").select("nombre").eq("id", data.rolId).maybeSingle();
    if (!rol) return res.status(400).json({ success: false, message: "El rol o el área no existen" });
    const isResponsible = ROLES_RESPONSABLES.has(rol.nombre);
    if (isResponsible && categorias.length === 0) {
      return res.status(400).json({ success: false, message: "Selecciona al menos una categoría para este responsable" });
    }
    if (categorias.length) {
      const { data: existentes } = await supabase.from("categorias").select("id").in("id", categorias);
      if ((existentes?.length || 0) !== categorias.length) {
        return res.status(400).json({ success: false, message: "Una o más categorías no existen" });
      }
    }

    const hash = await bcrypt.hash(data.password, 12);
    const { data: nuevo, error } = await supabase
      .from("usuarios")
      .insert({
        nombre: data.nombre, apellido: data.apellido, cargo: data.cargo, correo: data.correo,
        password: hash, rol_id: data.rolId, area_id: data.areaId, estado: data.estado
      })
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") return res.status(409).json({ success: false, message: "El correo ya está registrado" });
      if (error.code === "23503") return res.status(400).json({ success: false, message: "El rol o el área no existen" });
      throw error;
    }
    if (isResponsible && categorias.length) {
      await supabase.from("categorias_tecnicos").insert(categorias.map(categoria_id => ({ tecnico_id: nuevo.id, categoria_id })));
    }
    return res.status(201).json({ success: true, id: nuevo.id, message: "Usuario creado correctamente" });
  } catch (error) {
    console.error("Error creando usuario:", error.message);
    return res.status(500).json({ success: false, message: "Error creando usuario" });
  }
}
export async function actualizarUsuario(req, res) {
  try {
    const id = enteroPositivo(req.params.id);
    const data = datosUsuario(req.body);
    if (!id || !data) return res.status(400).json({ success: false, message: "Los datos del usuario no son válidos" });
    if (id === Number(req.usuario.id) && data.estado === "Desactivado") {
      return res.status(400).json({ success: false, message: "No puedes desactivar tu propia cuenta." });
    }
    const categorias = idsCategorias(req.body?.categoria_ids);
    if (!categorias) return res.status(400).json({ success: false, message: "Las categorías seleccionadas no son válidas" });

    const { data: source } = await supabase.from("usuarios").select("id,estado,nombre,apellido").eq("id", id).maybeSingle();
    if (!source) return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    const sourceNombre = `${source.nombre} ${source.apellido}`;

    let transferencia = { valid: true, tickets: [], tecnico: null };
    if (data.estado === "Desactivado") {
      transferencia = await transferirTicketsPendientesSiAplica(id, req.body?.transferir_a_id);
      if (!transferencia.valid) {
        return res.status(409).json({ success: false, message: transferencia.message, requiere_transferencia: true });
      }
    }

    const cambios = {
      nombre: data.nombre, apellido: data.apellido, cargo: data.cargo, correo: data.correo,
      rol_id: data.rolId, area_id: data.areaId, estado: data.estado
    };
    if (data.password) cambios.password = await bcrypt.hash(data.password, 12);

    const { data: actualizado, error } = await supabase.from("usuarios").update(cambios).eq("id", id).select("id").maybeSingle();
    if (error) {
      if (error.code === "23505") return res.status(409).json({ success: false, message: "El correo ya está registrado" });
      if (error.code === "23503") return res.status(400).json({ success: false, message: "El rol o el área no existen" });
      throw error;
    }
    if (!actualizado) return res.status(404).json({ success: false, message: "Usuario no encontrado" });

    const categorySync = await sincronizarCategorias(id, data.rolId, categorias);
    if (!categorySync.valid) {
      return res.status(400).json({ success: false, message: categorySync.message });
    }

    notificarTransferencia(transferencia, sourceNombre, req.usuario.id);
    revocarSesionesUsuario(id);
    desconectarConexionesUsuario(id);
    return res.json({ success: true, message: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error("Error actualizando usuario:", error.message);
    return res.status(500).json({ success: false, message: "Error actualizando usuario" });
  }
}
export async function eliminarUsuario(req, res) {
  try {
    const id = enteroPositivo(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Usuario no válido" });
    if (id === Number(req.usuario.id)) return res.status(400).json({ success: false, message: "No puedes eliminar tu propio usuario" });

    const { data: source } = await supabase.from("usuarios").select("id,nombre,apellido").eq("id", id).maybeSingle();
    if (!source) return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    const sourceNombre = `${source.nombre} ${source.apellido}`;

    const transferencia = await transferirTicketsPendientesSiAplica(id, req.body?.transferir_a_id);
    if (!transferencia.valid) {
      return res.status(409).json({ success: false, message: transferencia.message, requiere_transferencia: true });
    }

    const { data: eliminado, error } = await supabase.from("usuarios").delete().eq("id", id).select("id").maybeSingle();
    if (error) {
      if (error.code === "23503") return res.status(409).json({ success: false, message: "No puedes eliminar un usuario con registros relacionados" });
      throw error;
    }
    if (!eliminado) return res.status(404).json({ success: false, message: "Usuario no encontrado" });

    notificarTransferencia(transferencia, sourceNombre, req.usuario.id);
    revocarSesionesUsuario(id);
    desconectarConexionesUsuario(id);
    return res.json({ success: true, message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminando usuario:", error.message);
    return res.status(500).json({ success: false, message: "Error eliminando usuario" });
  }
}
