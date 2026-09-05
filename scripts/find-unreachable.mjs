import { access, readdir, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIRECTORY, "..");
const SOURCE_EXTENSIONS = [".js", ".jsx", ".mjs", ".cjs"];
const pathKey = filename => process.platform === "win32"
  ? path.resolve(filename).toLowerCase()
  : path.resolve(filename);

const requireFromFrontend = createRequire(
  path.join(PROJECT_ROOT, "frontend", "package.json"),
);
const reactPluginEntry = requireFromFrontend.resolve("@vitejs/plugin-react");
const requireFromReactPlugin = createRequire(reactPluginEntry);
const babelCoreEntry = requireFromReactPlugin.resolve("@babel/core");
const requireFromBabel = createRequire(babelCoreEntry);
const { parse } = requireFromBabel("@babel/parser");

async function fileExists(filename) {
  try {
    await access(filename, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(entryPath)));
    } else if (SOURCE_EXTENSIONS.includes(path.extname(entry.name))) {
      files.push(path.resolve(entryPath));
    }
  }

  return files;
}

function collectImportSpecifiers(node, specifiers = new Set()) {
  if (!node || typeof node !== "object") {
    return specifiers;
  }

  if (
    ["ImportDeclaration", "ExportAllDeclaration", "ExportNamedDeclaration"].includes(
      node.type,
    ) &&
    typeof node.source?.value === "string"
  ) {
    specifiers.add(node.source.value);
  }

  if (
    node.type === "CallExpression" &&
    node.callee?.type === "Import" &&
    typeof node.arguments?.[0]?.value === "string"
  ) {
    specifiers.add(node.arguments[0].value);
  }

  if (
    node.type === "ImportExpression" &&
    typeof node.source?.value === "string"
  ) {
    specifiers.add(node.source.value);
  }

  for (const [key, value] of Object.entries(node)) {
    if (["comments", "errors", "extra", "loc", "tokens"].includes(key)) {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((child) => collectImportSpecifiers(child, specifiers));
    } else if (value && typeof value === "object") {
      collectImportSpecifiers(value, specifiers);
    }
  }

  return specifiers;
}

async function resolveLocalImport(importer, specifier) {
  if (!specifier.startsWith(".")) {
    return null;
  }

  const basePath = path.resolve(path.dirname(importer), specifier);
  const explicitExtension = path.extname(basePath);

  if (explicitExtension && !SOURCE_EXTENSIONS.includes(explicitExtension)) {
    return null;
  }

  const candidates = explicitExtension
    ? [basePath]
    : [
        ...SOURCE_EXTENSIONS.map((extension) => `${basePath}${extension}`),
        ...SOURCE_EXTENSIONS.map((extension) =>
          path.join(basePath, `index${extension}`),
        ),
      ];

  for (const candidate of candidates) {
    if (await fileExists(candidate)) {
      return path.resolve(candidate);
    }
  }

  return null;
}

async function findReachable(entrypoints) {
  const reachable = new Set();
  const pending = entrypoints.map((entrypoint) => path.resolve(entrypoint));

  while (pending.length > 0) {
    const filename = pending.pop();
    const filenameKey = pathKey(filename);

    if (reachable.has(filenameKey)) {
      continue;
    }

    reachable.add(filenameKey);
    const source = await readFile(filename, "utf8");
    const ast = parse(source, {
      allowAwaitOutsideFunction: true,
      plugins: ["jsx"],
      sourceType: "unambiguous",
    });
    const specifiers = collectImportSpecifiers(ast);

    for (const specifier of specifiers) {
      const dependency = await resolveLocalImport(filename, specifier);
      if (dependency && !reachable.has(pathKey(dependency))) {
        pending.push(dependency);
      }
    }
  }

  return reachable;
}

async function reportUnreachable(label, sourceDirectory, entrypoints) {
  const allFiles = await collectFiles(sourceDirectory);
  const reachable = await findReachable(entrypoints);
  const unreachable = allFiles
    .filter((filename) => !reachable.has(pathKey(filename)))
    .sort((left, right) => left.localeCompare(right));

  console.log(`\n${label}: ${unreachable.length} archivos no alcanzables`);
  unreachable.forEach((filename) =>
    console.log(path.relative(PROJECT_ROOT, filename)),
  );
}

await reportUnreachable(
  "Frontend",
  path.join(PROJECT_ROOT, "frontend", "src"),
  [path.join(PROJECT_ROOT, "frontend", "src", "main.jsx")],
);

const backendAuxiliaryEntrypoints = [
  ...(await collectFiles(path.join(PROJECT_ROOT, "backend", "scripts"))),
  ...(await collectFiles(path.join(PROJECT_ROOT, "backend", "test"))),
];

await reportUnreachable(
  "Backend",
  path.join(PROJECT_ROOT, "backend", "src"),
  [path.join(PROJECT_ROOT, "backend", "server.js"), ...backendAuxiliaryEntrypoints],
);
