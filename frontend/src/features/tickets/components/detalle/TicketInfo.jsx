import { CalendarCheck, CalendarPlus, Flag, Tag, User, UserCheck } from "lucide-react";

const ICONS = {
  Solicitante: User,
  Responsable: UserCheck,
  Categoría: Tag,
  Prioridad: Flag,
  Creado: CalendarPlus,
  Cerrado: CalendarCheck
};

function formatDate(value) {
  if (!value) return "Sin registrar";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin registrar";

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function validColor(color, fallback) {
  return /^#[0-9a-f]{6}$/i.test(String(color || "")) ? color : fallback;
}

function DetailValue({ item }) {
  if (!item.color) return <dd>{item.value || "Sin información"}</dd>;

  return (
    <dd>
      <span
        className="ticket-info-badge"
        style={{
          "--info-color": item.color,
          "--info-soft": `${item.color}16`
        }}
      >
        {item.value || "Sin información"}
      </span>
    </dd>
  );
}

function TicketInfo({ ticket }) {
  const information = [
    { label: "Solicitante", value: ticket.usuario },
    ...(ticket.tecnico ? [{ label: "Responsable", value: ticket.tecnico }] : []),
    { label: "Categoría", value: ticket.categoria },
    {
      label: "Prioridad",
      value: ticket.prioridad,
      color: validColor(ticket.prioridad_color, "#e37c27")
    },
    { label: "Creado", value: formatDate(ticket.fecha_creacion) },
    ...(ticket.fecha_cierre ? [{ label: "Cerrado", value: formatDate(ticket.fecha_cierre) }] : [])
  ];

  return (
    <section className="ticket-detail-section">
      <h4>Información del ticket</h4>
      <dl className="ticket-info-list">
        {information.map(item => {
          const Icon = ICONS[item.label];
          return (
            <div key={item.label} className="ticket-info-row">
              <dt>
                {Icon && <Icon className="ticket-info-icon" strokeWidth={2} aria-hidden="true" />}
                {item.label}
              </dt>
              <DetailValue item={item} />
            </div>
          );
        })}
      </dl>
    </section>
  );
}

export default TicketInfo;
