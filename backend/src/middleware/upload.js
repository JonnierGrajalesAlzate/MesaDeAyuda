import { randomUUID } from "crypto";
import path from "path";
import multer from "multer";
const MIME_EXTENSIONS = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/gif", ".gif"],
  ["image/webp", ".webp"],
  ["application/pdf", ".pdf"],
  ["text/plain", ".txt"],
  ["application/msword", ".doc"],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".docx"],
  ["application/vnd.ms-excel", ".xls"],
  ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ".xlsx"],
  ["application/zip", ".zip"],
  ["application/x-zip-compressed", ".zip"]
]);
export const TIPOS_TICKET = new Set(["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"]);
export const TIPOS_BASE_CONOCIMIENTO = new Set(MIME_EXTENSIONS.keys());
const CODIGO_CONTROL_MAX = 31;
const CODIGO_CONTROL_DEL = 127;
function esCaracterControl(codigo) {
  return codigo <= CODIGO_CONTROL_MAX || codigo === CODIGO_CONTROL_DEL;
}
function nombreOriginalSeguro(originalname) {
  const base = path.basename(String(originalname || "archivo"));
  let limpio = "";
  for (let i = 0; i < base.length; i++) {
    limpio += esCaracterControl(base.charCodeAt(i)) ? "_" : base[i];
  }
  return limpio.slice(0, 180) || "archivo";
}
function startsWith(buffer, bytes) {
  return bytes.every((value, index) => buffer[index] === value);
}
function firmaValida(mimetype, buffer) {
  if (mimetype === "image/jpeg") return startsWith(buffer, [0xff, 0xd8, 0xff]);
  if (mimetype === "image/png") {
    return startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  }
  if (mimetype === "image/gif") {
    return ["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString("ascii"));
  }
  if (mimetype === "image/webp") {
    return buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  }
  if (mimetype === "application/pdf") {
    return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
  }
  if (mimetype === "text/plain") return !buffer.includes(0);
  if (["application/msword", "application/vnd.ms-excel"].includes(mimetype)) {
    return startsWith(buffer, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
  }
  if (["application/zip", "application/x-zip-compressed", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"].includes(mimetype)) {
    return startsWith(buffer, [0x50, 0x4b, 0x03, 0x04]) || startsWith(buffer, [0x50, 0x4b, 0x05, 0x06]) || startsWith(buffer, [0x50, 0x4b, 0x07, 0x08]);
  }
  return false;
}
export function crearUploadSeguro({
  tiposPermitidos,
  campo
}) {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024,
      files: 1,
      fields: 12,
      parts: 13,
      fieldNameSize: 80,
      fieldSize: 64 * 1024
    },
    fileFilter: (_req, file, callback) => {
      file.originalname = nombreOriginalSeguro(file.originalname);
      callback(tiposPermitidos.has(file.mimetype) ? null : new Error("Tipo de archivo no permitido"), true);
    }
  }).single(campo);
  return (req, res, next) => upload(req, res, error => {
    if (error) {
      const message = error.code === "LIMIT_FILE_SIZE" ? "El archivo no puede superar 10 MB" : "El archivo enviado no es válido";
      return res.status(400).json({
        success: false,
        message
      });
    }
    if (!req.file) return next();
    if (!firmaValida(req.file.mimetype, req.file.buffer.subarray(0, 512))) {
      req.file = undefined;
      return res.status(400).json({
        success: false,
        message: "El contenido del archivo no coincide con su tipo"
      });
    }
    const extension = MIME_EXTENSIONS.get(req.file.mimetype) || "";
    req.file.filename = `${randomUUID()}${extension}`;
    return next();
  });
}
