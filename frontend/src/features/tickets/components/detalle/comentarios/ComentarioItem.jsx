function initials(comment) {
  const values = [comment.nombre, comment.apellido].filter(Boolean);
  return values.length
    ? values.map(value => value.charAt(0).toUpperCase()).slice(0, 2).join("")
    : "U";
}

function commentTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function ComentarioItem({ comentario, modoAuditoria = false }) {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const viewerRole = String(usuario.rol || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const supportViewer = viewerRole.includes("tecn") || viewerRole.includes("admin");
  const supportMessage = [1, 2].includes(Number(comentario.rol_id));
  const writtenByViewer = Number(comentario.usuario_id) === Number(usuario.id);
  const isMine = modoAuditoria || supportViewer ? supportMessage : writtenByViewer;
  const author = [comentario.nombre, comentario.apellido].filter(Boolean).join(" ") || "Usuario";

  return (
    <article className={`ticket-comment ${isMine ? "is-mine" : "is-other"}`}>
      {!isMine && <span className="ticket-comment-avatar">{initials(comentario)}</span>}

      <div className="ticket-comment-content">
        <div className="ticket-comment-meta">
          <strong>{modoAuditoria ? author : writtenByViewer ? "Tú" : author}</strong>
          <time dateTime={comentario.fecha}>{commentTime(comentario.fecha)}</time>
        </div>
        <p>{comentario.comentario}</p>
      </div>

      {isMine && <span className="ticket-comment-avatar">{initials(comentario)}</span>}
    </article>
  );
}

export default ComentarioItem;
