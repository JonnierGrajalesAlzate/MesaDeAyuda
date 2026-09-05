# SoporteLG

Mesa de ayuda desarrollada con React, Express y PostgreSQL.

## Ejecutar el proyecto

1. Configura `backend/.env` y, si es necesario, `frontend/.env` usando sus archivos `.env.example`.
2. Instala las dependencias dentro de `backend` y `frontend` con `pnpm install`.
3. Ejecuta `pnpm dev` en ambas carpetas.

## Organización del frontend

- `src/app`: rutas, layouts, navegación y páginas.
- `src/features`: lógica y componentes agrupados por funcionalidad.
- `src/shared`: componentes UI, hooks y servicios reutilizables.
- `src/assets`: imágenes y recursos visuales.

Las páginas coordinan cada vista; los componentes de `features` resuelven cada
caso de uso y las piezas pequeñas compartidas viven en `shared`.

## Validación

- Frontend: `pnpm run check`
- Backend: `pnpm run check`
- Archivos no utilizados: `node scripts/find-unreachable.mjs`
