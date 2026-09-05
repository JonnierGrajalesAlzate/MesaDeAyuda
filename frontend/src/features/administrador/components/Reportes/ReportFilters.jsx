import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FilterDisclosure from "../../../../shared/ui/Filters/FilterDisclosure.jsx";
import FilterDropdown from "../../../../shared/ui/Filters/FilterDropdown.jsx";

function parseISODate(value) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatISODate(date) {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function DateFilter({ label, value, onChange, min, max }) {
  return (
    <DatePicker
      selected={parseISODate(value)}
      onChange={date => onChange(formatISODate(date))}
      dateFormat="dd/MM/yyyy"
      showYearDropdown
      scrollableYearDropdown
      yearDropdownItemNumber={100}
      showMonthDropdown
      dropdownMode="select"
      placeholderText={label}
      maxDate={parseISODate(max)}
      minDate={parseISODate(min)}
      wrapperClassName="min-w-0 flex-1"
      className="h-10 w-full rounded-none border border-slate-300 px-3 text-sm outline-none transition focus:border-[#0076e3] focus:ring-2 focus:ring-blue-100"
    />
  );
}

function DateRangeFilter({ start, end, onStartChange, onEndChange }) {
  return (
    <div className="flex gap-3 sm:col-span-2">
      <DateFilter label="Desde" value={start} max={end || undefined} onChange={onStartChange} />
      <DateFilter label="Hasta" value={end} min={start || undefined} onChange={onEndChange} />
    </div>
  );
}

export default function ReportFilters({ filters, data, onChange }) {
  const estadoOptions = data.estados.map(status => ({
    value: String(status.estado_id),
    label: status.estado
  }));
  const tecnicoOptions = data.tecnicos
    .filter(technician => technician.tecnico_id)
    .map(technician => ({ value: String(technician.tecnico_id), label: technician.tecnico }));
  const categoriaOptions = data.categorias.map(category => ({
    value: String(category.categoria_id),
    label: category.categoria
  }));
  const areaOptions = data.areas
    .filter(area => area.area_id)
    .map(area => ({ value: String(area.area_id), label: area.area }));
  const prioridadOptions = data.prioridades.map(priority => ({
    value: String(priority.prioridad_id),
    label: priority.prioridad
  }));

  return (
    <FilterDisclosure
      title="Configurar reporte"
      description="Define el período y combina los criterios que deseas incluir en el análisis."
      className="report-filter-panel"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 xl:items-end">
        <DateRangeFilter
          start={filters.inicio}
          end={filters.fin}
          onStartChange={value => onChange("inicio", value)}
          onEndChange={value => onChange("fin", value)}
        />
        <FilterDropdown label="Estado" value={filters.estado} onChange={value => onChange("estado", value)} options={estadoOptions} multiple />
        <FilterDropdown label="Técnico" value={filters.tecnico} onChange={value => onChange("tecnico", value)} options={tecnicoOptions} multiple />
        <FilterDropdown label="Categoría" value={filters.categoria} onChange={value => onChange("categoria", value)} options={categoriaOptions} multiple />
        <FilterDropdown label="Área" value={filters.area} onChange={value => onChange("area", value)} options={areaOptions} multiple />
        <FilterDropdown label="Prioridad" value={filters.prioridad} onChange={value => onChange("prioridad", value)} options={prioridadOptions} multiple />
      </div>
    </FilterDisclosure>
  );
}
