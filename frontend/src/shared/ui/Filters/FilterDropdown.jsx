import { useEffect, useId, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";

function sameValue(left, right) {
  return String(left ?? "") === String(right ?? "");
}

export default function FilterDropdown({
  label,
  value,
  onChange,
  options = [],
  defaultValue = "",
  className = "",
  multiple = false,
  fill = false,
  showCheckbox = multiple
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const listId = useId();
  const selectedValues = useMemo(
    () => multiple ? (Array.isArray(value) ? value : []) : [value],
    [multiple, value]
  );
  const selectedOptions = useMemo(
    () => options.filter(option => selectedValues.some(item => sameValue(item, option.value)) && !sameValue(option.value, defaultValue)),
    [defaultValue, options, selectedValues]
  );
  const hasSelection = selectedOptions.length > 0;
  const buttonLabel = hasSelection
    ? `${selectedOptions[0].label}${selectedOptions.length > 1 ? ` (+${selectedOptions.length - 1})` : ""}`
    : label;

  useEffect(() => {
    if (!open) return undefined;

    const closeOnOutsideClick = event => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = event => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const selectOption = option => {
    if (!multiple) {
      onChange(option.value);
      setOpen(false);
      return;
    }

    const exists = selectedValues.some(item => sameValue(item, option.value));
    onChange(exists
      ? selectedValues.filter(item => !sameValue(item, option.value))
      : [...selectedValues, option.value]);
  };

  const clearSelection = () => onChange(multiple ? [] : defaultValue);

  return (
    <div ref={containerRef} className={`relative min-w-0 ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen(current => !current)}
        className={`filter-dropdown-trigger flex h-10 ${fill ? "w-full" : "w-fit max-w-full"} items-center justify-between gap-2 border-0 px-3 text-left text-sm transition ${
          hasSelection ? "is-active font-semibold" : "font-medium"
        }`}
      >
        <span className="min-w-0 truncate">{buttonLabel}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className={`h-3.5 w-3.5 shrink-0 fill-none stroke-current transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m5 7.5 5 5 5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute left-0 z-40 mt-1 max-h-64 w-max min-w-52 max-w-[min(20rem,calc(100vw-2rem))] overflow-y-auto rounded border border-slate-300 bg-white p-1 shadow-lg"
        >
          {options.filter(option => !multiple || !sameValue(option.value, defaultValue)).map(option => {
            const selected = selectedValues.some(item => sameValue(item, option.value));
            return (
              <button
                type="button"
                role="option"
                aria-selected={selected}
                key={`${String(option.value)}-${option.label}`}
                onClick={() => selectOption(option)}
                className={`filter-dropdown-option flex min-h-9 w-full items-center gap-3 border-0 px-3 py-2 text-left text-sm ${
                  selected ? "is-selected font-semibold" : ""
                }`}
              >
                {showCheckbox && (
                  <input
                    type="checkbox"
                    checked={selected}
                    readOnly
                    tabIndex={-1}
                    aria-hidden="true"
                    className="pointer-events-none h-4 w-4 shrink-0 accent-[#0076e3]"
                  />
                )}
                <span>{option.label}</span>
              </button>
            );
          })}
          {hasSelection && (
            <div className="mt-1 flex justify-end border-t border-slate-200 pt-1">
              <button type="button" onClick={clearSelection} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-[#0076e3]">
                <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                <span>Limpiar</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
