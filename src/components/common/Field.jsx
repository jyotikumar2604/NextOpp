import { cloneElement, useId } from "react";

/** Label + control + hint/error wiring in one place so every form is accessible by default. */
export default function Field({ label, hint, error, required, children, className }) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-800">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      {cloneElement(children, { id, "aria-describedby": describedBy, "aria-invalid": error ? "true" : undefined })}
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p id={`${id}-err`} className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
