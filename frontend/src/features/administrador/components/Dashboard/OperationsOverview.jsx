import MyTickets from "./MyTickets.jsx";
import TechnicianWorkload from "./TechnicianWorkload.jsx";

/** Organiza la operación administrativa en dos columnas: carga del equipo y mis tickets. */
export default function OperationsOverview({ technicians, administratorId, refreshKey }) {
  return (
    <section className="grid min-w-0 items-stretch gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="min-w-0">
        <TechnicianWorkload technicians={technicians} />
      </div>

      <MyTickets administratorId={administratorId} refreshKey={refreshKey} />
    </section>
  );
}
