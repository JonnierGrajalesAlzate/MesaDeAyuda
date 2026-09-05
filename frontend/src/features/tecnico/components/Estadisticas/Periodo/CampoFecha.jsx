import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
function CampoFecha({
  label,
  fecha,
  setFecha,
  maxDate,
  minDate
}) {
  return <div className="flex flex-col gap-2">

            <label className="
                    text-sm
                    font-semibold
                    text-slate-700
                ">

                {label}

            </label>

            <DatePicker selected={fecha} onChange={setFecha} dateFormat="dd/MM/yyyy" showYearDropdown scrollableYearDropdown yearDropdownItemNumber={100} showMonthDropdown dropdownMode="select" placeholderText="Seleccione una fecha" maxDate={maxDate} minDate={minDate} className="
                    tecnico-date-input
                    w-56
                    border
                    border-slate-300
                    px-4
                    py-3
                    outline-none
                    transition
                    focus:border-[#0076e3]
                    focus:ring-2
                    focus:ring-blue-100
                " />

        </div>;
}
export default CampoFecha;
