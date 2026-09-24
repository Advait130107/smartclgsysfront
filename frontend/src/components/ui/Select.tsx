
import { useEffect, useId, useMemo, useRef, useState } from "react";

export type SelectOption = {
  value: string;
  label: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  name?: string;
};

export function Select({
  value,
  onChange,
  options,
  placeholder = "Select…",
  searchable = false,
  disabled = false,
  required = false,
  className = "",
  name,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selected = useMemo(
    () => options.find((o) => o.value === value) || null,
    [options, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div
      className={`ui-select ${open ? "open" : ""} ${disabled ? "disabled" : ""} ${className}`}
      ref={rootRef}
    >
      {name && (
        <input
          type="hidden"
          name={name}
          value={value}
          required={required}
        />
      )}
      <button
        type="button"
        className="ui-select-trigger"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          if (disabled) return;
          setOpen((v) => !v);
        }}
      >
        <span className={selected ? "" : "placeholder"}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="ui-select-caret" aria-hidden />
      </button>
      {open && (
        <div className="ui-select-menu" role="listbox" id={listId}>
          {searchable && (
            <div className="ui-select-search">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div className="ui-select-options">
            {!required && (
              <button
                type="button"
                role="option"
                className={`ui-select-option ${value === "" ? "active" : ""}`}
                onClick={() => {
                  onChange("");
                  setOpen(false);
                  setQuery("");
                }}
              >
                {placeholder}
              </button>
            )}
            {filtered.length === 0 && (
              <div className="ui-select-empty">No matches</div>
            )}
            {filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={o.value === value}
                className={`ui-select-option ${o.value === value ? "active" : ""}`}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                  setQuery("");
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
