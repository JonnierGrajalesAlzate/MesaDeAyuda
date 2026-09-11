-- Agrega una predicción de tickets del próximo mes a fn_reportes, calculada con
-- regresión lineal real (mínimos cuadrados) sobre la serie mensual de tickets
-- creados, usando las funciones nativas de Postgres regr_slope/regr_intercept.
--
-- Ejecutar una sola vez en el SQL Editor de Supabase.

CREATE OR REPLACE FUNCTION fn_reportes(
  p_inicio date,
  p_fin date,
  p_area_ids integer[],
  p_tecnico_ids integer[],
  p_categoria_ids integer[],
  p_estado_ids integer[],
  p_prioridad_ids integer[]
)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  WITH filtrados AS (
    SELECT t.*, u.area_id AS usuario_area_id
    FROM tickets t
    JOIN usuarios u ON u.id = t.usuario_id
    WHERE (p_inicio IS NULL OR t.fecha_creacion >= p_inicio::date)
      AND (p_fin IS NULL OR t.fecha_creacion < (p_fin::date + interval '1 day'))
      AND (p_area_ids IS NULL OR array_length(p_area_ids, 1) IS NULL OR u.area_id = ANY(p_area_ids))
      AND (p_tecnico_ids IS NULL OR array_length(p_tecnico_ids, 1) IS NULL OR t.tecnico_id = ANY(p_tecnico_ids))
      AND (p_categoria_ids IS NULL OR array_length(p_categoria_ids, 1) IS NULL OR t.categoria_id = ANY(p_categoria_ids))
      AND (p_estado_ids IS NULL OR array_length(p_estado_ids, 1) IS NULL OR t.estado_id = ANY(p_estado_ids))
      AND (p_prioridad_ids IS NULL OR array_length(p_prioridad_ids, 1) IS NULL OR t.prioridad_id = ANY(p_prioridad_ids))
  ),
  serie_mensual AS (
    SELECT DATE_TRUNC('month', fecha_creacion) AS mes,
           COUNT(*)::int AS creados,
           COUNT(*) FILTER (WHERE estado_id = 2)::int AS cerrados
    FROM filtrados
    GROUP BY DATE_TRUNC('month', fecha_creacion)
    ORDER BY DATE_TRUNC('month', fecha_creacion) DESC
    LIMIT 12
  )
  SELECT jsonb_build_object(
    'kpis', (
      SELECT jsonb_build_object(
        'total', COUNT(*)::int,
        'abiertos', COUNT(*) FILTER (WHERE estado_id = 1)::int,
        'cerrados', COUNT(*) FILTER (WHERE estado_id = 2)::int,
        'proceso', COUNT(*) FILTER (WHERE estado_id = 3)::int,
        'espera', COUNT(*) FILTER (WHERE estado_id = 4)::int,
        'reabiertos', COUNT(*) FILTER (WHERE estado_id = 5)::int,
        'promedio_resolucion', COALESCE(ROUND((AVG(EXTRACT(EPOCH FROM (fecha_cierre - fecha_creacion)) / 3600))::numeric, 2), 0)
      ) FROM filtrados
    ),
    'estados', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('estado_id', e.id, 'estado', e.nombre, 'color', e.color, 'total', totales.total) ORDER BY e.id), '[]'::jsonb)
      FROM estados e
      CROSS JOIN LATERAL (SELECT COUNT(f.id)::int AS total FROM filtrados f WHERE f.estado_id = e.id) totales
    ),
    'tecnicos', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'tecnico_id', fila.tecnico_id, 'tecnico', fila.tecnico,
        'asignados', fila.asignados, 'cerrados', fila.cerrados, 'pendientes', fila.pendientes
      ) ORDER BY fila.asignados DESC), '[]'::jsonb)
      FROM (
        SELECT tec.id AS tecnico_id, CONCAT(tec.nombre, ' ', tec.apellido) AS tecnico,
               COUNT(f.id)::int AS asignados,
               COUNT(f.id) FILTER (WHERE f.estado_id = 2)::int AS cerrados,
               COUNT(f.id) FILTER (WHERE f.estado_id IN (1,3,4,5))::int AS pendientes
        FROM filtrados f
        LEFT JOIN usuarios tec ON tec.id = f.tecnico_id
        GROUP BY tec.id, tec.nombre, tec.apellido
      ) fila
    ),
    'areas', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'area_id', fila.area_id, 'area', fila.area, 'total', fila.total, 'cerrados', fila.cerrados
      ) ORDER BY fila.total DESC), '[]'::jsonb)
      FROM (
        SELECT a.id AS area_id, COALESCE(a.nombre, 'Sin área') AS area,
               COUNT(f.id)::int AS total,
               COUNT(f.id) FILTER (WHERE f.estado_id = 2)::int AS cerrados
        FROM filtrados f
        LEFT JOIN areas a ON a.id = f.usuario_area_id
        GROUP BY a.id, a.nombre
      ) fila
    ),
    'categorias', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'categoria_id', fila.categoria_id, 'categoria', fila.categoria, 'total', fila.total
      ) ORDER BY fila.total DESC), '[]'::jsonb)
      FROM (
        SELECT c.id AS categoria_id, c.nombre AS categoria, COUNT(f.id)::int AS total
        FROM filtrados f
        JOIN categorias c ON c.id = f.categoria_id
        GROUP BY c.id, c.nombre
      ) fila
    ),
    'prioridades', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'prioridad_id', fila.prioridad_id, 'prioridad', fila.prioridad,
        'prioridad_color', fila.prioridad_color, 'total', fila.total
      ) ORDER BY fila.total DESC), '[]'::jsonb)
      FROM (
        SELECT p.id AS prioridad_id, p.nombre AS prioridad, p.color AS prioridad_color, COUNT(f.id)::int AS total
        FROM filtrados f
        JOIN prioridades p ON p.id = f.prioridad_id
        GROUP BY p.id, p.nombre, p.color
      ) fila
    ),
    'tendencia', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'periodo', TO_CHAR(mes, 'Mon YYYY'), 'creados', creados, 'cerrados', cerrados
      ) ORDER BY mes ASC), '[]'::jsonb)
      FROM serie_mensual
    ),
    -- Regresión lineal real (mínimos cuadrados) sobre "creados" sin importar el mes:
    -- x = índice cronológico del mes (0,1,2,...), y = tickets creados ese mes.
    -- regr_slope/regr_intercept son funciones nativas de Postgres que ajustan
    -- la recta y = pendiente*x + intercepto minimizando el error cuadrático.
    'prediccion', (
      SELECT CASE WHEN COUNT(*) < 2 THEN NULL ELSE
        jsonb_build_object(
          'pendiente', ROUND(regr_slope(creados, indice)::numeric, 3),
          'intercepto', ROUND(regr_intercept(creados, indice)::numeric, 3),
          'proximo_periodo', TO_CHAR(MAX(mes) + interval '1 month', 'Mon YYYY'),
          'tickets_estimados', GREATEST(0, ROUND((regr_slope(creados, indice) * COUNT(*) + regr_intercept(creados, indice))::numeric))::int,
          'meses_analizados', COUNT(*)::int
        )
      END
      FROM (
        SELECT mes, creados, (ROW_NUMBER() OVER (ORDER BY mes) - 1)::float8 AS indice
        FROM serie_mensual
      ) serie_indexada
    ),
    'recientes', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', f.id, 'titulo', f.titulo,
        'usuario', CONCAT(u.nombre, ' ', u.apellido),
        'tecnico', CONCAT(tec.nombre, ' ', tec.apellido),
        'estado', e.nombre, 'color', e.color,
        'prioridad', p.nombre, 'prioridad_color', p.color,
        'fecha_creacion', f.fecha_creacion
      ) ORDER BY f.fecha_creacion DESC), '[]'::jsonb)
      FROM filtrados f
      JOIN usuarios u ON u.id = f.usuario_id
      LEFT JOIN usuarios tec ON tec.id = f.tecnico_id
      JOIN estados e ON e.id = f.estado_id
      JOIN prioridades p ON p.id = f.prioridad_id
    )
  );
$$;
