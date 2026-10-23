import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "./Button";

export default function ErrorState({ title = "Something went wrong", message, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center">
      <AlertTriangle className="mb-3 size-6 text-red-600" aria-hidden />
      <h3 className="text-base font-semibold text-stone-900">{title}</h3>
      {message && <p className="mt-1 max-w-md text-sm text-stone-600">{message}</p>}
      {onRetry && (
        <Button variant="secondary" className="mt-5" onClick={onRetry}>
          <RotateCw /> Try again
        </Button>
      )}
    </div>
  );
}
