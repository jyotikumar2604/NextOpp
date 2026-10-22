import { useApp } from "../../context/AppContext";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";

/** Renders loading and error UI for the initial data load so pages only handle the "ready" case. */
export default function DataGate({ children }) {
  const { status, error, reload } = useApp();
  if (status === "loading") return <LoadingState variant="page" count={3} label="Loading your dashboard" />;
  if (status === "error") return <ErrorState title="We couldn't load your data" message={error} onRetry={reload} />;
  return children;
}
