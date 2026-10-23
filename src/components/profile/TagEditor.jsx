import { useId, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "../common/Button";
import { SKILL_LEVELS } from "../../data/constants";

/**
 * Add/remove list editor. Items are strings, or { name, level } objects when `withLevel` is set.
 * Duplicates (case-insensitive) are rejected with an inline message.
 */
export default function TagEditor({ label, items, onChange, suggestions = [], withLevel = false, placeholder, error }) {
  const id = useId();
  const [value, setValue] = useState("");
  const [level, setLevel] = useState("Intermediate");
  const [localError, setLocalError] = useState("");

  const nameOf = (i) => (withLevel ? i.name : i);

  const add = () => {
    const name = value.trim();
    if (!name) return;
    if (items.some((i) => nameOf(i).toLowerCase() === name.toLowerCase())) {
      setLocalError(`"${name}" is already on your list.`);
      return;
    }
    setLocalError("");
    onChange([...items, withLevel ? { name, level } : name]);
    setValue("");
  };

  const msg = localError || error;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-stone-800">{label}</label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={id}
          list={`${id}-list`}
          value={value}
          onChange={(e) => { setValue(e.target.value); setLocalError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          maxLength={40}
          placeholder={placeholder}
          aria-invalid={msg ? "true" : undefined}
          aria-describedby={msg ? `${id}-err` : undefined}
          className="input flex-1"
        />
        <datalist id={`${id}-list`}>{suggestions.map((s) => <option key={s} value={s} />)}</datalist>
        {withLevel && (
          <select aria-label="Proficiency" value={level} onChange={(e) => setLevel(e.target.value)} className="input sm:w-40">
            {SKILL_LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
        )}
        <Button variant="secondary" onClick={add}><Plus /> Add</Button>
      </div>
      {msg && <p id={`${id}-err`} className="mt-1 text-xs font-medium text-red-600">{msg}</p>}

      {items.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {items.map((i) => (
            <li key={nameOf(i)} className="inline-flex items-center gap-1.5 rounded-lg bg-stone-100 py-1 pl-2.5 pr-1 text-sm text-stone-800">
              {nameOf(i)}
              {withLevel && <span className="text-xs text-stone-500">· {i.level}</span>}
              <button type="button" onClick={() => onChange(items.filter((x) => nameOf(x) !== nameOf(i)))} aria-label={`Remove ${nameOf(i)}`} className="rounded p-0.5 text-stone-400 hover:bg-stone-200 hover:text-stone-800">
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
