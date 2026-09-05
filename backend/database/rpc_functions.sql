-- =====================================================================
-- Funciones RPC para SoporteLG en Supabase
-- Reemplazan la lógica que antes vivía en transacciones de "pg" (BEGIN/
-- COMMIT/ROLLBACK) o en consultas SQL con agregaciones/joins dinámicos
-- que el query builder de supabase-js/PostgREST no puede expresar
-- directamente. El backend las invoca vía supabase.rpc('nombre', {...}).
--
-- Ejecutar UNA SOLA VEZ en el SQL Editor de Supabase. Es seguro volver
-- a ejecutarlo (usa CREATE OR REPLACE FUNCTION).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Crear ticket (auto-asignación de técnico + prioridad por
--    categoría/subcategoría/crítico, todo en una sola transacción)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_crear_ticket(
  p_titulo text,
  p_descripcion text,
  p_categoria_id integer,
  p_subcategoria_id integer,
  p_usuario_id integer,
  p_es_critico boolean
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_prioridad_id integer;
  v_prioridad_alta_id integer;
  v_tecnico_id integer;
  v_estado_id integer := 4; -- EN ESPERA
  v_ticket jsonb;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM usuarios WHERE id = p_usuario_id) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Usuario o categoría no válidos');
  END IF;

  SELECT prioridad_id INTO v_prioridad_id FROM categorias WHERE id = p_categoria_id;
  IF v_prioridad_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Usuario o categoría no válidos');
  END IF;

  IF p_subcategoria_id IS NOT NULL THEN
    SELECT prioridad_id INTO v_prioridad_id
    FROM subcategorias
    WHERE id = p_subcategoria_id AND categoria_id = p_categoria_id;
    IF v_prioridad_id IS NULL THEN
      RETURN jsonb_build_object('success', false, 'message', 'La subcategoría seleccionada no es válida');
    END IF;
  END IF;

  IF p_es_critico THEN
    SELECT id INTO v_prioridad_alta_id FROM prioridades WHERE LOWER(nombre) = 'alta' LIMIT 1;
    IF v_prioridad_alta_id IS NOT NULL THEN
      v_prioridad_id := v_prioridad_alta_id;
    END IF;
  END IF;

  SELECT ct.tecnico_id INTO v_tecnico_id
  FROM categorias_tecnicos ct
  INNER JOIN usuarios responsable
    ON responsable.id = ct.tecnico_id
    AND COALESCE(responsable.estado, 'Activo') <> 'Desactivado'
  INNER JOIN roles rol_responsable
    ON rol_responsable.id = responsable.rol_id
    AND rol_responsable.nombre IN ('Tecnico', 'Administrador')
  LEFT JOIN tickets t
    ON t.tecnico_id = ct.tecnico_id
    AND t.estado_id IN (1, 3, 5)
  WHERE ct.categoria_id = p_categoria_id
  GROUP BY ct.tecnico_id
  HAVING COUNT(t.id) < 2
  ORDER BY COUNT(t.id) ASC, RANDOM()
  LIMIT 1;

  IF v_tecnico_id IS NOT NULL THEN
    v_estado_id := 1; -- ABIERTO
  END IF;

  INSERT INTO tickets (titulo, descripcion, categoria_id, prioridad_id, usuario_id, tecnico_id, estado_id, fecha_creacion)
  VALUES (p_titulo, p_descripcion, p_categoria_id, v_prioridad_id, p_usuario_id, v_tecnico_id, v_estado_id, NOW())
  RETURNING to_jsonb(tickets.*) INTO v_ticket;

  RETURN jsonb_build_object('success', true, 'ticket', v_ticket);
END;
$$;

-- ---------------------------------------------------------------------
-- 2. Tomar ticket (bloqueo + validación de elegibilidad + asignación)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_tomar_ticket(
  p_ticket_id integer,
  p_responsable_id integer
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_ticket tickets%ROWTYPE;
  v_responsable_nombre text;
BEGIN
  SELECT * INTO v_ticket FROM tickets WHERE id = p_ticket_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Ticket no encontrado');
  END IF;

  IF v_ticket.estado_id <> 4 OR v_ticket.tecnico_id IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Este ticket ya fue tomado por otro responsable o dejó de estar disponible');
  END IF;

  SELECT CONCAT(u.nombre, ' ', u.apellido) INTO v_responsable_nombre
  FROM usuarios u
  INNER JOIN roles r ON r.id = u.rol_id AND r.nombre IN ('Tecnico', 'Administrador')
  INNER JOIN categorias_tecnicos ct ON ct.tecnico_id = u.id AND ct.categoria_id = v_ticket.categoria_id
  WHERE u.id = p_responsable_id AND COALESCE(u.estado, 'Activo') <> 'Desactivado';

  IF v_responsable_nombre IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'No estás autorizado para atender la categoría de este ticket');
  END IF;

  UPDATE tickets
  SET tecnico_id = p_responsable_id, estado_id = 1, fecha_actualizacion = NOW(), fecha_cierre = NULL
  WHERE id = p_ticket_id AND tecnico_id IS NULL AND estado_id = 4;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'El ticket acaba de ser tomado por otro responsable');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Ticket asignado correctamente',
    'ticket_id', p_ticket_id,
    'usuario_id', v_ticket.usuario_id,
    'responsable_nombre', v_responsable_nombre
  );
END;
$$;

-- ---------------------------------------------------------------------
-- 3. Solicitudes de reasignación (crear / resolver)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_crear_solicitud_reasignacion(
  p_ticket_id integer,
  p_solicitante_id integer,
  p_tecnico_destino_id integer
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_ticket tickets%ROWTYPE;
  v_rol_destino text;
  v_solicitud jsonb;
BEGIN
  SELECT * INTO v_ticket FROM tickets WHERE id = p_ticket_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Ticket no encontrado');
  END IF;

  IF v_ticket.tecnico_id IS DISTINCT FROM p_solicitante_id THEN
    RETURN jsonb_build_object('success', false, 'message', 'Solo el técnico asignado puede solicitar la reasignación de este ticket');
  END IF;

  IF p_tecnico_destino_id = p_solicitante_id THEN
    RETURN jsonb_build_object('success', false, 'message', 'Selecciona un técnico distinto a ti mismo');
  END IF;

  SELECT r.nombre INTO v_rol_destino
  FROM usuarios u
  INNER JOIN roles r ON r.id = u.rol_id AND r.nombre IN ('Tecnico', 'Administrador')
  INNER JOIN categorias_tecnicos ct ON ct.tecnico_id = u.id AND ct.categoria_id = v_ticket.categoria_id
  WHERE u.id = p_tecnico_destino_id AND COALESCE(u.estado, 'Activo') <> 'Desactivado';

  IF v_rol_destino IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'El técnico seleccionado no puede atender la categoría de este ticket');
  END IF;

  IF EXISTS (SELECT 1 FROM solicitudes_reasignacion WHERE ticket_id = p_ticket_id AND estado = 'PENDIENTE') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Ya existe una solicitud de reasignación pendiente para este ticket');
  END IF;

  INSERT INTO solicitudes_reasignacion (ticket_id, solicitante_id, tecnico_destino_id)
  VALUES (p_ticket_id, p_solicitante_id, p_tecnico_destino_id)
  RETURNING jsonb_build_object(
    'id', id, 'ticket_id', ticket_id, 'estado', estado,
    'fecha_solicitud', fecha_solicitud, 'fecha_respuesta', fecha_respuesta
  ) INTO v_solicitud;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Solicitud de reasignación enviada',
    'solicitud', v_solicitud,
    'ticket', to_jsonb(v_ticket.*),
    'rol_destino', v_rol_destino
  );
END;
$$;

CREATE OR REPLACE FUNCTION fn_resolver_solicitud_reasignacion(
  p_ticket_id integer,
  p_solicitud_id bigint,
  p_actor_id integer,
  p_decision text
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_ticket tickets%ROWTYPE;
  v_solicitud solicitudes_reasignacion%ROWTYPE;
  v_nuevo_estado text;
BEGIN
  SELECT * INTO v_ticket FROM tickets WHERE id = p_ticket_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Ticket no encontrado');
  END IF;

  SELECT * INTO v_solicitud FROM solicitudes_reasignacion WHERE id = p_solicitud_id AND ticket_id = p_ticket_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Solicitud no encontrada');
  END IF;

  IF v_solicitud.tecnico_destino_id <> p_actor_id THEN
    RETURN jsonb_build_object('success', false, 'message', 'Solo el técnico destinatario puede responder esta solicitud');
  END IF;

  IF v_solicitud.estado <> 'PENDIENTE' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Esta solicitud ya fue respondida');
  END IF;

  v_nuevo_estado := CASE WHEN p_decision = 'ACEPTAR' THEN 'ACEPTADA' ELSE 'RECHAZADA' END;

  UPDATE solicitudes_reasignacion
  SET estado = v_nuevo_estado, respondido_por_id = p_actor_id, fecha_respuesta = NOW()
  WHERE id = p_solicitud_id;

  IF p_decision = 'ACEPTAR' THEN
    UPDATE tickets SET tecnico_id = p_actor_id, fecha_actualizacion = NOW() WHERE id = p_ticket_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', CASE WHEN p_decision = 'ACEPTAR' THEN 'Ticket reasignado correctamente' ELSE 'Solicitud rechazada' END,
    'estado', v_nuevo_estado,
    'ticket', to_jsonb(v_ticket.*)
  );
END;
$$;

-- ---------------------------------------------------------------------
-- 4. Solicitudes de reapertura (crear / resolver)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_crear_solicitud_reapertura(
  p_ticket_id integer,
  p_solicitante_id integer,
  p_motivo text
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_ticket tickets%ROWTYPE;
  v_solicitud jsonb;
BEGIN
  SELECT * INTO v_ticket FROM tickets WHERE id = p_ticket_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Ticket no encontrado');
  END IF;

  IF v_ticket.usuario_id <> p_solicitante_id THEN
    RETURN jsonb_build_object('success', false, 'message', 'Solo el creador del ticket puede solicitar su reapertura');
  END IF;

  IF v_ticket.estado_id <> 2 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Solo se puede solicitar la reapertura de un ticket cerrado');
  END IF;

  IF EXISTS (SELECT 1 FROM solicitudes_reapertura WHERE ticket_id = p_ticket_id AND estado = 'PENDIENTE') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Ya existe una solicitud de reapertura pendiente');
  END IF;

  INSERT INTO solicitudes_reapertura (ticket_id, solicitante_id, tecnico_id, motivo)
  VALUES (p_ticket_id, p_solicitante_id, v_ticket.tecnico_id, p_motivo)
  RETURNING jsonb_build_object(
    'id', id, 'ticket_id', ticket_id, 'motivo', motivo, 'estado', estado,
    'fecha_solicitud', fecha_solicitud, 'fecha_respuesta', fecha_respuesta
  ) INTO v_solicitud;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Solicitud de reapertura enviada al técnico',
    'solicitud', v_solicitud,
    'ticket', to_jsonb(v_ticket.*)
  );
END;
$$;

CREATE OR REPLACE FUNCTION fn_resolver_solicitud_reapertura(
  p_ticket_id integer,
  p_solicitud_id bigint,
  p_actor_id integer,
  p_decision text
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_ticket tickets%ROWTYPE;
  v_solicitud solicitudes_reapertura%ROWTYPE;
  v_nuevo_estado text;
BEGIN
  SELECT * INTO v_ticket FROM tickets WHERE id = p_ticket_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Ticket no encontrado');
  END IF;

  SELECT * INTO v_solicitud FROM solicitudes_reapertura WHERE id = p_solicitud_id AND ticket_id = p_ticket_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Solicitud no encontrada');
  END IF;

  IF v_solicitud.estado <> 'PENDIENTE' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Esta solicitud ya fue respondida');
  END IF;

  IF p_decision = 'ACEPTAR' AND v_ticket.estado_id <> 2 THEN
    RETURN jsonb_build_object('success', false, 'message', 'El ticket ya no está cerrado');
  END IF;

  v_nuevo_estado := CASE WHEN p_decision = 'ACEPTAR' THEN 'ACEPTADA' ELSE 'RECHAZADA' END;

  UPDATE solicitudes_reapertura
  SET estado = v_nuevo_estado, respondido_por_id = p_actor_id, fecha_respuesta = NOW()
  WHERE id = p_solicitud_id;

  IF p_decision = 'ACEPTAR' THEN
    UPDATE tickets SET estado_id = 5, fecha_cierre = NULL, fecha_actualizacion = NOW() WHERE id = p_ticket_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', CASE WHEN p_decision = 'ACEPTAR' THEN 'Ticket reabierto correctamente' ELSE 'Solicitud rechazada' END,
    'estado', v_nuevo_estado,
    'ticket', to_jsonb(v_ticket.*)
  );
END;
$$;

-- ---------------------------------------------------------------------
-- 5. Actualizar estado de un ticket (incluye reapertura directa por
--    técnico/admin, que auto-acepta cualquier solicitud pendiente)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_actualizar_estado_ticket(
  p_ticket_id integer,
  p_estado_id integer,
  p_actor_id integer,
  p_actor_rol text
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_ticket tickets%ROWTYPE;
  v_solicitud_aceptada bigint;
BEGIN
  SELECT * INTO v_ticket FROM tickets WHERE id = p_ticket_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Ticket no encontrado');
  END IF;

  IF p_actor_rol = 'Tecnico' AND v_ticket.tecnico_id IS DISTINCT FROM p_actor_id THEN
    RETURN jsonb_build_object('success', false, 'message', 'Este ticket no está asignado a tu cuenta.');
  END IF;

  IF p_estado_id = 5 AND v_ticket.estado_id <> 2 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Solo se puede reabrir un ticket cerrado.');
  END IF;

  IF p_estado_id = 2 THEN
    UPDATE tickets SET estado_id = p_estado_id, fecha_actualizacion = NOW(), fecha_cierre = NOW() WHERE id = p_ticket_id;
  ELSE
    UPDATE tickets SET estado_id = p_estado_id, fecha_actualizacion = NOW(), fecha_cierre = NULL WHERE id = p_ticket_id;
  END IF;

  IF p_estado_id = 5 THEN
    UPDATE solicitudes_reapertura
    SET estado = 'ACEPTADA', respondido_por_id = p_actor_id, fecha_respuesta = NOW()
    WHERE ticket_id = p_ticket_id AND estado = 'PENDIENTE'
    RETURNING id INTO v_solicitud_aceptada;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Estado actualizado correctamente.',
    'ticket', to_jsonb(v_ticket.*),
    'solicitud_reapertura_aceptada', v_solicitud_aceptada
  );
END;
$$;

-- ---------------------------------------------------------------------
-- 6. Reasignar ticket directamente (Administrador)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_reasignar_ticket_admin(
  p_ticket_id integer,
  p_tecnico_id integer,
  p_actor_id integer
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_ticket tickets%ROWTYPE;
  v_tecnico_nombre text;
  v_tecnico_rol text;
BEGIN
  SELECT * INTO v_ticket FROM tickets WHERE id = p_ticket_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Ticket no encontrado');
  END IF;

  SELECT CONCAT(u.nombre, ' ', u.apellido), r.nombre INTO v_tecnico_nombre, v_tecnico_rol
  FROM usuarios u
  INNER JOIN roles r ON r.id = u.rol_id AND r.nombre IN ('Tecnico', 'Administrador')
  INNER JOIN categorias_tecnicos ct ON ct.tecnico_id = u.id AND ct.categoria_id = v_ticket.categoria_id
  WHERE u.id = p_tecnico_id AND COALESCE(u.estado, 'Activo') <> 'Desactivado';

  IF v_tecnico_nombre IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'El técnico seleccionado no está autorizado para la categoría de este ticket');
  END IF;

  IF v_ticket.tecnico_id = p_tecnico_id THEN
    RETURN jsonb_build_object('success', false, 'message', 'El ticket ya está asignado a este técnico');
  END IF;

  UPDATE tickets
  SET tecnico_id = p_tecnico_id,
      estado_id = CASE WHEN estado_id = 4 THEN 1 ELSE estado_id END,
      fecha_actualizacion = NOW()
  WHERE id = p_ticket_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Ticket reasignado a ' || v_tecnico_nombre,
    'ticket', jsonb_build_object('usuario_id', v_ticket.usuario_id, 'tecnico_id_anterior', v_ticket.tecnico_id, 'titulo', v_ticket.titulo),
    'tecnico_nombre', v_tecnico_nombre,
    'tecnico_rol', v_tecnico_rol
  );
END;
$$;

-- ---------------------------------------------------------------------
-- 7. Transferencia de tickets pendientes (desactivar/eliminar usuario)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_plan_transferencia_usuario(p_usuario_id integer)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_total integer;
  v_tecnicos jsonb;
BEGIN
  SELECT COUNT(*)::int INTO v_total
  FROM tickets
  WHERE tecnico_id = p_usuario_id AND estado_id = ANY(ARRAY[1,3,5]);

  WITH categorias_pendientes AS (
    SELECT DISTINCT categoria_id
    FROM tickets
    WHERE tecnico_id = p_usuario_id AND estado_id = ANY(ARRAY[1,3,5])
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object('id', u.id, 'nombre', CONCAT(u.nombre, ' ', u.apellido), 'tickets_activos', activos.total) ORDER BY activos.total ASC, u.nombre ASC), '[]'::jsonb)
  INTO v_tecnicos
  FROM usuarios u
  INNER JOIN roles r ON r.id = u.rol_id AND r.nombre = 'Tecnico'
  CROSS JOIN LATERAL (
    SELECT COUNT(t.id)::int AS total
    FROM tickets t
    WHERE t.tecnico_id = u.id AND t.estado_id = ANY(ARRAY[1,3,5])
  ) activos
  WHERE u.id <> p_usuario_id
    AND COALESCE(u.estado, 'Activo') <> 'Desactivado'
    AND NOT EXISTS (
      SELECT 1 FROM categorias_pendientes cp
      WHERE NOT EXISTS (
        SELECT 1 FROM categorias_tecnicos ct
        WHERE ct.tecnico_id = u.id AND ct.categoria_id = cp.categoria_id
      )
    );

  RETURN jsonb_build_object('total', v_total, 'tecnicos', v_tecnicos);
END;
$$;

CREATE OR REPLACE FUNCTION fn_transferir_tickets_pendientes(
  p_origen_id integer,
  p_destino_id integer
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_pending jsonb;
  v_pending_ids integer[];
  v_category_ids integer[];
  v_target_nombre text;
BEGIN
  -- FOR UPDATE no puede combinarse con funciones de agregación en la misma
  -- consulta: primero se bloquean las filas, luego se agregan por separado
  -- (ya bloqueadas, dentro de la misma transacción de la función).
  PERFORM 1 FROM tickets WHERE tecnico_id = p_origen_id AND estado_id = ANY(ARRAY[1,3,5]) FOR UPDATE;

  SELECT COALESCE(jsonb_agg(jsonb_build_object('id', id, 'usuario_id', usuario_id, 'categoria_id', categoria_id) ORDER BY id), '[]'::jsonb),
         COALESCE(array_agg(id ORDER BY id), ARRAY[]::integer[]),
         COALESCE(array_agg(DISTINCT categoria_id), ARRAY[]::integer[])
  INTO v_pending, v_pending_ids, v_category_ids
  FROM tickets
  WHERE tecnico_id = p_origen_id AND estado_id = ANY(ARRAY[1,3,5]);

  IF array_length(v_pending_ids, 1) IS NULL THEN
    RETURN jsonb_build_object('valid', true, 'tickets', '[]'::jsonb, 'tecnico', NULL);
  END IF;

  IF p_destino_id IS NULL OR p_destino_id = p_origen_id THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Selecciona el técnico que recibirá los tickets pendientes');
  END IF;

  SELECT CONCAT(u.nombre, ' ', u.apellido) INTO v_target_nombre
  FROM usuarios u
  INNER JOIN roles r ON r.id = u.rol_id AND r.nombre = 'Tecnico'
  WHERE u.id = p_destino_id
    AND COALESCE(u.estado, 'Activo') <> 'Desactivado'
    AND NOT EXISTS (
      SELECT 1 FROM unnest(v_category_ids) AS categoria_requerida(categoria_id)
      WHERE NOT EXISTS (
        SELECT 1 FROM categorias_tecnicos ct
        WHERE ct.tecnico_id = u.id AND ct.categoria_id = categoria_requerida.categoria_id
      )
    )
  FOR UPDATE;

  IF v_target_nombre IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'message', 'El técnico seleccionado no está activo o no cubre todas las categorías de los tickets pendientes');
  END IF;

  UPDATE tickets
  SET tecnico_id = p_destino_id, fecha_actualizacion = NOW()
  WHERE id = ANY(v_pending_ids);

  RETURN jsonb_build_object(
    'valid', true,
    'tickets', v_pending,
    'tecnico', jsonb_build_object('id', p_destino_id, 'nombre', v_target_nombre)
  );
END;
$$;

-- ---------------------------------------------------------------------
-- 8. Panel de administrador: listado de tickets con filtros dinámicos
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_admin_tickets(
  p_search text,
  p_status text,
  p_technician integer
)
RETURNS TABLE (
  id integer, titulo character varying, fecha_creacion timestamp, fecha_cierre timestamp,
  usuario text, tecnico text, tecnico_id integer, categoria character varying,
  estado character varying, color character varying, prioridad character varying,
  prioridad_color character varying, total_comentarios integer
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    t.id, t.titulo, t.fecha_creacion, t.fecha_cierre,
    CONCAT(u.nombre, ' ', u.apellido) AS usuario,
    CONCAT(tec.nombre, ' ', tec.apellido) AS tecnico,
    t.tecnico_id,
    c.nombre AS categoria,
    e.nombre AS estado, e.color,
    p.nombre AS prioridad, p.color AS prioridad_color,
    COUNT(co.id)::int AS total_comentarios
  FROM tickets t
  INNER JOIN usuarios u ON u.id = t.usuario_id
  LEFT JOIN usuarios tec ON tec.id = t.tecnico_id
  INNER JOIN categorias c ON c.id = t.categoria_id
  INNER JOIN estados e ON e.id = t.estado_id
  INNER JOIN prioridades p ON p.id = t.prioridad_id
  LEFT JOIN comentarios co ON co.ticket_id = t.id
  WHERE
    (p_search IS NULL OR (
      t.titulo ILIKE '%' || p_search || '%'
      OR CONCAT(u.nombre, ' ', u.apellido) ILIKE '%' || p_search || '%'
      OR CONCAT(tec.nombre, ' ', tec.apellido) ILIKE '%' || p_search || '%'
    ))
    AND (p_status IS NULL OR e.nombre = p_status)
    AND (p_technician IS NULL OR t.tecnico_id = p_technician)
  GROUP BY t.id, u.nombre, u.apellido, tec.nombre, tec.apellido, c.nombre, e.nombre, e.color, p.nombre, p.color
  ORDER BY t.fecha_creacion DESC
  LIMIT 1000;
$$;

-- ---------------------------------------------------------------------
-- 9. Resumen administrativo (totales + estados + técnicos + recientes)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_admin_resumen()
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
    'totales', (
      SELECT jsonb_build_object(
        'total', COUNT(*)::int,
        'activos', COUNT(*) FILTER (WHERE estado_id IN (1, 3, 5))::int,
        'cerrados', COUNT(*) FILTER (WHERE estado_id = 2)::int,
        'espera', COUNT(*) FILTER (WHERE estado_id = 4)::int
      ) FROM tickets
    ),
    'estados', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('estado_id', e.id, 'estado', e.nombre, 'color', e.color, 'total', totales.total) ORDER BY e.id), '[]'::jsonb)
      FROM estados e
      CROSS JOIN LATERAL (SELECT COUNT(t.id)::int AS total FROM tickets t WHERE t.estado_id = e.id) totales
    ),
    'tecnicos', (
      SELECT COALESCE(jsonb_agg(fila ORDER BY (fila->>'pendientes')::int DESC, (fila->>'realizados')::int DESC, fila->>'tecnico'), '[]'::jsonb)
      FROM (
        SELECT jsonb_build_object(
          'id', u.id,
          'tecnico', CONCAT(u.nombre, ' ', u.apellido),
          'rol', r.nombre,
          'total', COUNT(t.id)::int,
          'pendientes', COUNT(t.id) FILTER (WHERE t.estado_id IN (1, 3, 4, 5))::int,
          'realizados', COUNT(t.id) FILTER (WHERE t.estado_id = 2)::int
        ) AS fila
        FROM usuarios u
        INNER JOIN roles r ON r.id = u.rol_id
        LEFT JOIN tickets t ON t.tecnico_id = u.id
        WHERE r.nombre IN ('Tecnico', 'Administrador')
        GROUP BY u.id, u.nombre, u.apellido, r.nombre
      ) sub
    ),
    'recientes', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', t.id, 'titulo', t.titulo,
        'usuario', CONCAT(u.nombre, ' ', u.apellido),
        'tecnico', CONCAT(tec.nombre, ' ', tec.apellido),
        'estado', e.nombre, 'color', e.color,
        'fecha_creacion', t.fecha_creacion
      ) ORDER BY t.fecha_creacion DESC), '[]'::jsonb)
      FROM (
        SELECT * FROM tickets ORDER BY fecha_creacion DESC LIMIT 8
      ) t
      JOIN usuarios u ON u.id = t.usuario_id
      LEFT JOIN usuarios tec ON tec.id = t.tecnico_id
      JOIN estados e ON e.id = t.estado_id
    )
  );
$$;

-- ---------------------------------------------------------------------
-- 10. Tickets por estado (panel administrador)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_admin_tickets_por_estado(p_estado_id integer)
RETURNS TABLE (id integer, usuario text, tecnico text)
LANGUAGE sql
STABLE
AS $$
  SELECT
    t.id,
    CONCAT(u.nombre, ' ', u.apellido) AS usuario,
    COALESCE(NULLIF(CONCAT(tec.nombre, ' ', tec.apellido), ' '), 'Sin asignar') AS tecnico
  FROM tickets t
  INNER JOIN usuarios u ON u.id = t.usuario_id
  LEFT JOIN usuarios tec ON tec.id = t.tecnico_id
  WHERE t.estado_id = p_estado_id
  ORDER BY t.fecha_creacion DESC
  LIMIT 250;
$$;

-- ---------------------------------------------------------------------
-- 11. Técnicos elegibles para un ticket (por categoría)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_tecnicos_elegibles_ticket(p_categoria_id integer)
RETURNS TABLE (id integer, nombre text, tickets_activos integer)
LANGUAGE sql
STABLE
AS $$
  SELECT
    u.id,
    CONCAT(u.nombre, ' ', u.apellido) AS nombre,
    COUNT(t.id) FILTER (WHERE t.estado_id IN (1,3,5))::int AS tickets_activos
  FROM categorias_tecnicos ct
  INNER JOIN usuarios u ON u.id = ct.tecnico_id
  INNER JOIN roles r ON r.id = u.rol_id AND r.nombre IN ('Tecnico', 'Administrador')
  LEFT JOIN tickets t ON t.tecnico_id = u.id
  WHERE ct.categoria_id = p_categoria_id
    AND COALESCE(u.estado, 'Activo') <> 'Desactivado'
  GROUP BY u.id, u.nombre, u.apellido
  ORDER BY tickets_activos ASC, nombre ASC;
$$;

-- ---------------------------------------------------------------------
-- 12. Listado de usuarios (con categorías agregadas por técnico)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_usuarios_listado()
RETURNS TABLE (
  id integer, nombre character varying, apellido character varying, cargo character varying,
  correo character varying, rol_id integer, rol text, area_id integer, area text,
  fecha_creacion timestamp, estado character varying, categoria_ids jsonb, categorias text
)
LANGUAGE sql
STABLE
AS $$
  SELECT u.id, u.nombre, u.apellido, u.cargo, u.correo,
         u.rol_id, r.nombre AS rol, u.area_id, a.nombre AS area,
         u.fecha_creacion, u.estado,
         COALESCE((
           SELECT json_agg(ct.categoria_id ORDER BY ct.categoria_id)
           FROM categorias_tecnicos ct
           WHERE ct.tecnico_id = u.id
         ), '[]'::json)::jsonb AS categoria_ids,
         COALESCE((
           SELECT string_agg(c.nombre, ', ' ORDER BY c.nombre)
           FROM categorias_tecnicos ct
           INNER JOIN categorias c ON c.id = ct.categoria_id
           WHERE ct.tecnico_id = u.id
         ), '') AS categorias
  FROM usuarios u
  LEFT JOIN roles r ON r.id = u.rol_id
  LEFT JOIN areas a ON a.id = u.area_id
  ORDER BY u.fecha_creacion DESC;
$$;

-- ---------------------------------------------------------------------
-- 13. Dashboards
-- ---------------------------------------------------------------------
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
      ) ORDER BY t.fecha_creacion ASC), '[]'::jsonb)
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

CREATE OR REPLACE FUNCTION fn_dashboard_usuario(p_usuario_id integer)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
    'total', COUNT(*)::int,
    'pendientes', COUNT(*) FILTER (WHERE estado_id IN (1, 3, 4, 5))::int,
    'resueltos', COUNT(*) FILTER (WHERE estado_id = 2)::int
  )
  FROM tickets
  WHERE usuario_id = p_usuario_id;
$$;

-- ---------------------------------------------------------------------
-- 14. Listado de tickets de un usuario con conteo de comentarios
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_tickets_todos_usuario(p_usuario_id integer)
RETURNS TABLE (
  id integer, estado_id integer, titulo character varying, descripcion text,
  categoria character varying, estado character varying, prioridad character varying,
  prioridad_color character varying, color character varying,
  fecha_creacion timestamp, total_comentarios bigint
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    t.id, t.estado_id, t.titulo, t.descripcion,
    c.nombre AS categoria, e.nombre AS estado,
    p.nombre AS prioridad, p.color AS prioridad_color, e.color,
    t.fecha_creacion,
    COUNT(co.id) AS total_comentarios
  FROM tickets t
  INNER JOIN categorias c ON c.id = t.categoria_id
  INNER JOIN estados e ON e.id = t.estado_id
  INNER JOIN prioridades p ON p.id = t.prioridad_id
  LEFT JOIN comentarios co ON co.ticket_id = t.id
  WHERE t.usuario_id = p_usuario_id
  GROUP BY t.id, t.estado_id, t.titulo, t.descripcion, c.nombre, e.nombre, e.color, p.nombre, p.color, t.fecha_creacion
  ORDER BY t.fecha_creacion DESC;
$$;

-- ---------------------------------------------------------------------
-- 15. Reportes administrativos (filtros dinámicos por fecha/área/
--     técnico/categoría/estado/prioridad)
-- ---------------------------------------------------------------------
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
      FROM (
        SELECT DATE_TRUNC('month', fecha_creacion) AS mes,
               COUNT(*)::int AS creados,
               COUNT(*) FILTER (WHERE estado_id = 2)::int AS cerrados
        FROM filtrados
        GROUP BY DATE_TRUNC('month', fecha_creacion)
        ORDER BY DATE_TRUNC('month', fecha_creacion) DESC
        LIMIT 12
      ) sub
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

-- ---------------------------------------------------------------------
-- 16. Estadísticas de tickets de un técnico (con tiempo de resolución
--     legible y conteo de comentarios)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_tickets_estadisticas_tecnico(p_tecnico_id integer)
RETURNS TABLE (
  id integer, titulo character varying, descripcion text, usuario text,
  categoria character varying, estado character varying, prioridad character varying,
  prioridad_color character varying, color character varying,
  fecha_creacion timestamp, fecha_cierre timestamp,
  tiempo_estimado text, total_comentarios bigint
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    t.id, t.titulo, t.descripcion,
    CONCAT(u.nombre, ' ', u.apellido) AS usuario,
    c.nombre AS categoria, e.nombre AS estado,
    p.nombre AS prioridad, p.color AS prioridad_color, e.color,
    t.fecha_creacion, t.fecha_cierre,
    CASE
      WHEN t.fecha_cierre IS NULL THEN 'Por definir'
      WHEN EXTRACT(EPOCH FROM (t.fecha_cierre - t.fecha_creacion)) < 3600 THEN
        CONCAT(FLOOR(EXTRACT(EPOCH FROM (t.fecha_cierre - t.fecha_creacion)) / 60)::int, ' min')
      WHEN EXTRACT(EPOCH FROM (t.fecha_cierre - t.fecha_creacion)) < 86400 THEN
        CONCAT(
          FLOOR(EXTRACT(EPOCH FROM (t.fecha_cierre - t.fecha_creacion)) / 3600)::int, ' h ',
          FLOOR(MOD(EXTRACT(EPOCH FROM (t.fecha_cierre - t.fecha_creacion)), 3600) / 60)::int, ' min'
        )
      ELSE
        CONCAT(
          FLOOR(EXTRACT(EPOCH FROM (t.fecha_cierre - t.fecha_creacion)) / 86400)::int, ' día',
          CASE WHEN FLOOR(EXTRACT(EPOCH FROM (t.fecha_cierre - t.fecha_creacion)) / 86400) > 1 THEN 's ' ELSE ' ' END,
          FLOOR(MOD(EXTRACT(EPOCH FROM (t.fecha_cierre - t.fecha_creacion)), 86400) / 3600)::int, ' h ',
          FLOOR(MOD(EXTRACT(EPOCH FROM (t.fecha_cierre - t.fecha_creacion)), 3600) / 60)::int, ' min'
        )
    END AS tiempo_estimado,
    COUNT(co.id) AS total_comentarios
  FROM tickets t
  INNER JOIN usuarios u ON u.id = t.usuario_id
  INNER JOIN categorias c ON c.id = t.categoria_id
  INNER JOIN estados e ON e.id = t.estado_id
  INNER JOIN prioridades p ON p.id = t.prioridad_id
  LEFT JOIN comentarios co ON co.ticket_id = t.id
  WHERE t.tecnico_id = p_tecnico_id
  GROUP BY t.id, t.titulo, u.nombre, u.apellido, c.nombre, e.nombre, e.color, p.nombre, p.color, t.fecha_creacion, t.fecha_cierre
  ORDER BY t.fecha_creacion DESC;
$$;

-- ---------------------------------------------------------------------
-- 17. Establecer archivo principal de un procedimiento (desmarca los
--     demás y marca el elegido, en una sola operación atómica)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_establecer_archivo_principal(p_procedimiento_id integer, p_archivo_id integer)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE procedimiento_archivos SET es_principal = FALSE WHERE procedimiento_id = p_procedimiento_id;
  UPDATE procedimiento_archivos SET es_principal = TRUE WHERE id = p_archivo_id;
END;
$$;

-- ---------------------------------------------------------------------
-- 19. Detalle completo de un ticket (incluye tamaño real del adjunto en
--     bytes vía octet_length, que PostgREST no puede calcular al vuelo)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_ticket_detalle(p_id integer)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT to_jsonb(fila) FROM (
    SELECT
      t.id, t.usuario_id, t.tecnico_id, t.titulo, t.descripcion,
      t.estado_id, e.nombre AS estado, e.color,
      t.prioridad_id, p.nombre AS prioridad, p.color AS prioridad_color,
      t.categoria_id, c.nombre AS categoria,
      CONCAT(u.nombre, ' ', u.apellido) AS usuario,
      CASE WHEN tec.id IS NULL THEN NULL ELSE CONCAT(tec.nombre, ' ', tec.apellido) END AS tecnico,
      t.fecha_creacion, t.fecha_cierre,
      a.nombre_archivo, a.ruta_archivo, octet_length(a.contenido) AS tamano_archivo
    FROM tickets t
    INNER JOIN usuarios u ON u.id = t.usuario_id
    LEFT JOIN usuarios tec ON tec.id = t.tecnico_id
    INNER JOIN categorias c ON c.id = t.categoria_id
    INNER JOIN prioridades p ON p.id = t.prioridad_id
    INNER JOIN estados e ON e.id = t.estado_id
    LEFT JOIN archivos_adjuntos a ON a.ticket_id = t.id
    WHERE t.id = p_id
  ) fila;
$$;

-- ---------------------------------------------------------------------
-- 20. Buscar usuario por correo para login (case-insensitive exacto;
--     evitamos ILIKE desde el cliente porque trataría "_"/"%" del correo
--     como comodines de patrón en vez de caracteres literales)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_buscar_usuario_login(p_correo text)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT to_jsonb(fila) FROM (
    SELECT u.id, u.nombre, u.apellido, u.correo, u.cargo, u.password, u.estado, r.nombre AS rol
    FROM usuarios u
    INNER JOIN roles r ON r.id = u.rol_id
    WHERE LOWER(u.correo) = LOWER(p_correo)
    LIMIT 1
  ) fila;
$$;


-- ---------------------------------------------------------------------
-- 18. Buscar tickets de referencia para la base de conocimiento
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_buscar_tickets_referencia(
  p_buscar text,
  p_solo_tecnico_id integer
)
RETURNS TABLE (
  id integer, titulo character varying, descripcion text, categoria_id integer,
  fecha_creacion timestamp, estado character varying, usuario text,
  categoria character varying, prioridad character varying
)
LANGUAGE sql
STABLE
AS $$
  SELECT t.id, t.titulo, t.descripcion, t.categoria_id, t.fecha_creacion, e.nombre AS estado,
         CONCAT(u.nombre, ' ', u.apellido) AS usuario,
         c.nombre AS categoria, pr.nombre AS prioridad
  FROM tickets t
  INNER JOIN estados e ON e.id = t.estado_id
  INNER JOIN usuarios u ON u.id = t.usuario_id
  INNER JOIN categorias c ON c.id = t.categoria_id
  INNER JOIN prioridades pr ON pr.id = t.prioridad_id
  WHERE (p_solo_tecnico_id IS NULL OR t.tecnico_id = p_solo_tecnico_id)
    AND (
      p_buscar IS NULL OR p_buscar = '' OR (
        CAST(t.id AS TEXT) ILIKE '%' || p_buscar || '%'
        OR t.titulo ILIKE '%' || p_buscar || '%'
        OR CONCAT(u.nombre, ' ', u.apellido) ILIKE '%' || p_buscar || '%'
        OR c.nombre ILIKE '%' || p_buscar || '%'
        OR pr.nombre ILIKE '%' || p_buscar || '%'
      )
    )
  ORDER BY t.fecha_creacion DESC
  LIMIT 20;
$$;
