import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { leerCookies } from "../src/middleware/auth.js";
import { puedeAccederTicket, puedeModificarProcedimiento, puedeVerProcedimiento } from "../src/services/accessControl.js";
import { crearSesion, limpiarSesionesParaPruebas, revocarSesion, validarSesion } from "../src/services/sessionService.js";
import { eliminarArchivoSeguro, UPLOADS_DIR } from "../src/middleware/upload.js";
import { enteroPositivo, texto } from "../src/utils/validation.js";
import { inicializarSocket } from "../src/sockets/socket.js";
import { emitirActividad, EVENTO_ACTIVIDAD } from "../src/services/realtimeService.js";
import { nombreSalaConversacion, usuarioActivoEnConversacion } from "../src/services/conversationPresenceService.js";
test("los identificadores solo aceptan enteros positivos", () => {
  assert.equal(enteroPositivo("42"), 42);
  assert.equal(enteroPositivo("1 OR 1=1"), null);
  assert.equal(enteroPositivo("1.5"), null);
  assert.equal(enteroPositivo("-1"), null);
});
test("los textos aplican longitud y rechazan bytes nulos", () => {
  assert.equal(texto("  contenido  ", {
    max: 20
  }), "contenido");
  assert.equal(texto("demasiado largo", {
    max: 5
  }), undefined);
  assert.equal(texto("hola\0mundo", {
    max: 20
  }), undefined);
});
test("un usuario o técnico solo accede a los tickets relacionados", () => {
  const ticket = {
    usuario_id: 10,
    tecnico_id: 20
  };
  assert.equal(puedeAccederTicket({
    id: 10,
    rol: "Usuario"
  }, ticket), true);
  assert.equal(puedeAccederTicket({
    id: 11,
    rol: "Usuario"
  }, ticket), false);
  assert.equal(puedeAccederTicket({
    id: 20,
    rol: "Tecnico"
  }, ticket), true);
  assert.equal(puedeAccederTicket({
    id: 21,
    rol: "Tecnico"
  }, ticket), false);
  assert.equal(puedeAccederTicket({
    id: 99,
    rol: "Administrador"
  }, ticket), true);
});
test("los borradores solo son visibles y editables por autor o administrador", () => {
  const draft = {
    autor_id: 20,
    estado: "BORRADOR",
    activo: true
  };
  const published = {
    ...draft,
    estado: "PUBLICADO"
  };
  assert.equal(puedeVerProcedimiento({
    id: 21,
    rol: "Tecnico"
  }, draft), false);
  assert.equal(puedeVerProcedimiento({
    id: 21,
    rol: "Tecnico"
  }, published), true);
  assert.equal(puedeModificarProcedimiento({
    id: 21,
    rol: "Tecnico"
  }, published), false);
  assert.equal(puedeModificarProcedimiento({
    id: 20,
    rol: "Tecnico"
  }, draft), true);
  assert.equal(puedeModificarProcedimiento({
    id: 99,
    rol: "Administrador"
  }, draft), true);
});
test("las sesiones pueden validarse y revocarse", () => {
  limpiarSesionesParaPruebas();
  const session = crearSesion(7, "Tecnico");
  assert.equal(validarSesion({
    jti: session.jti,
    usuarioId: 7,
    rol: "Tecnico"
  }), true);
  assert.equal(validarSesion({
    jti: session.jti,
    usuarioId: 8,
    rol: "Tecnico"
  }), false);
  const another = crearSesion(7, "Tecnico");
  revocarSesion(another.jti);
  assert.equal(validarSesion({
    jti: another.jti,
    usuarioId: 7,
    rol: "Tecnico"
  }), false);
});
test("el parser de cookies no contamina prototipos ni falla con escapes inválidos", () => {
  const cookies = leerCookies("soportelg_session=abc%20123; __proto__=polluted; malformed=%E0%A4%A");
  assert.equal(Object.getPrototypeOf(cookies), null);
  assert.equal(cookies.soportelg_session, "abc 123");
  assert.equal({}.polluted, undefined);
  assert.equal(cookies.malformed, "");
});
test("la eliminación de archivos rechaza rutas fuera de uploads", async () => {
  const outside = path.resolve(UPLOADS_DIR, "..", "secret.txt");
  await assert.rejects(() => eliminarArchivoSeguro(outside), /fuera del directorio permitido/);
});
test("los eventos en tiempo real solo contienen metadatos y usan salas autorizadas", () => {
  const emissions = [];
  inicializarSocket({
    to(rooms) {
      return {
        emit(event, payload) {
          emissions.push({
            rooms,
            event,
            payload
          });
        }
      };
    }
  });
  emitirActividad({
    recurso: "tickets",
    accion: "crear",
    entidadId: 45,
    ticketId: 45,
    usuarios: [7, 9],
    roles: ["Administrador"]
  });
  assert.equal(emissions.length, 1);
  assert.equal(emissions[0].event, EVENTO_ACTIVIDAD);
  assert.deepEqual(new Set(emissions[0].rooms), new Set(["usuario:7", "usuario:9", "rol:Administrador"]));
  assert.equal(emissions[0].payload.recurso, "tickets");
  assert.equal(emissions[0].payload.ticket_id, 45);
  assert.equal("titulo" in emissions[0].payload, false);
  assert.equal("descripcion" in emissions[0].payload, false);
  inicializarSocket(undefined);
});
test("la presencia de conversación se limita al ticket y usuario correctos", () => {
  const sala = nombreSalaConversacion(45, 7);
  inicializarSocket({
    sockets: {
      adapter: {
        rooms: new Map([[sala, new Set(["socket-1"])]])
      }
    }
  });
  assert.equal(sala, "conversacion:45:usuario:7");
  assert.equal(usuarioActivoEnConversacion(45, 7), true);
  assert.equal(usuarioActivoEnConversacion(45, 8), false);
  assert.equal(nombreSalaConversacion("id inválido", 7), null);
  inicializarSocket(undefined);
});
