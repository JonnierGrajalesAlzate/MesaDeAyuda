-- Agrega un nivel numérico a las prioridades (Alta=3, Media=2, Baja=1) y
-- reordena la cola del dashboard del técnico por prioridad (mayor a menor)
-- y, dentro de la misma prioridad, por fecha de creación (más antiguo primero).
--
-- Ejecutar una sola vez en el SQL Editor de Supabase.

ALTER TABLE public.prioridades ADD COLUMN IF NOT EXISTS nivel integer;

UPDATE public.prioridades
SET nivel = CASE LOWER(nombre)
  WHEN 'alta' THEN 3
  WHEN 'media' THEN 2
  WHEN 'baja' THEN 1
  ELSE 0
END
WHERE nivel IS NULL;

ALTER TABLE public.prioridades ALTER COLUMN nivel SET DEFAULT 1;
ALTER TABLE public.prioridades ALTER COLUMN nivel SET NOT NULL;

CREATE OR REPLACE FUNCTION fn_dashboard_tecnico(p_tecnico_id integer)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
    'estadisticas', (
      SELECT jsonb_build_object(
        'abiertos', COUNT(*) FILTER (WHERE estado_id = 1)::int,
        'proceso', COUNT(*) FILTER (WHERE estado_id = 3)::int,
        'espera', COUNT(*) FILTER (WHERE estado_id = 4)::int,
        'cerrados', COUNT(*) FILTER (WHERE estado_id = 2)::int,
        'reabiertos', COUNT(*) FILTER (WHERE estado_id = 5)::int,
        'reasignados', COUNT(*) FILTER (WHERE EXISTS (
          SELECT 1 FROM solicitudes_reasignacion sr2
          WHERE sr2.ticket_id = t.id AND sr2.tecnico_destino_id = p_tecnico_id AND sr2.estado = 'PENDIENTE'
        ))::int,
        'color_abierto', (SELECT color FROM estados WHERE id = 1),
        'color_proceso', (SELECT color FROM estados WHERE id = 3),
        'color_espera', (SELECT color FROM estados WHERE id = 4),
        'color_cerrado', (SELECT color FROM estados WHERE id = 2),
        'color_reabierto', (SELECT color FROM estados WHERE id = 5)
      )
      FROM tickets t
      WHERE t.tecnico_id = p_tecnico_id
         OR (
              t.tecnico_id IS NULL AND t.estado_id = 4
              AND EXISTS (SELECT 1 FROM categorias_tecnicos ct WHERE ct.tecnico_id = p_tecnico_id AND ct.categoria_id = t.categoria_id)
            )
         OR EXISTS (SELECT 1 FROM solicitudes_reasignacion sr WHERE sr.ticket_id = t.id AND sr.tecnico_destino_id = p_tecnico_id AND sr.estado = 'PENDIENTE')
    ),
    'tickets', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', t.id, 'titulo', t.titulo, 'descripcion', t.descripcion,
        'categoria', c.nombre, 'prioridad', p.nombre, 'prioridad_color', p.color,
        'estado_id', e.id, 'estado', e.nombre, 'color', e.color,
        'usuario', CONCAT(u.nombre, ' ', u.apellido),
        'fecha_creacion', t.fecha_creacion,
        'disponible', (t.tecnico_id IS NULL AND t.estado_id = 4),
        'solicitud_reasignacion_id', sr.id,
        'solicitud_origen_tecnico', CONCAT(so.nombre, ' ', so.apellido)
      ) ORDER BY p.nivel DESC, t.fecha_creacion ASC), '[]'::jsonb)
      FROM tickets t
      INNER JOIN categorias c ON c.id = t.categoria_id
      INNER JOIN prioridades p ON p.id = t.prioridad_id
      INNER JOIN estados e ON e.id = t.estado_id
      INNER JOIN usuarios u ON u.id = t.usuario_id
      LEFT JOIN solicitudes_reasignacion sr ON sr.ticket_id = t.id AND sr.tecnico_destino_id = p_tecnico_id AND sr.estado = 'PENDIENTE'
      LEFT JOIN usuarios so ON so.id = sr.solicitante_id
      WHERE t.tecnico_id = p_tecnico_id
         OR (
              t.tecnico_id IS NULL AND t.estado_id = 4
              AND EXISTS (SELECT 1 FROM categorias_tecnicos ct WHERE ct.tecnico_id = p_tecnico_id AND ct.categoria_id = t.categoria_id)
            )
         OR sr.id IS NOT NULL
    )
  );
$$;
