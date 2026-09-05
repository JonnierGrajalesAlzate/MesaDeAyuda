export default function FilterSearchInput({
  value,
  onChange,
  placeholder,
  label = "Buscar",
  className = ""
}) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="sr-only">{label}</span>
      <input
        type="search"
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        className="filter-search-input h-10 w-full bg-transparent px-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
      />
    </label>
  );
}
