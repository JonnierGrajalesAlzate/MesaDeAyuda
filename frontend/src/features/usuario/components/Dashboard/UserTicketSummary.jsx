const SUMMARY_ITEMS = [
  { key: "pendientes", label: "Pendientes", color: "#f97316" },
  { key: "resueltos", label: "Resueltos", color: "#00a87f" },
  { key: "total", label: "Total", color: "#1e222b" }
];

export default function UserTicketSummary({ statistics }) {
  return (
    <section className="user-ticket-summary" aria-label="Resumen de solicitudes">
      {SUMMARY_ITEMS.map(item => (
        <div key={item.key} style={{ "--summary-color": item.color }}>
          <span>{item.label}</span>
          <strong>{statistics[item.key]}</strong>
        </div>
      ))}
    </section>
  );
}
