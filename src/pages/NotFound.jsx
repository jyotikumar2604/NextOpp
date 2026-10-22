import { Compass } from "lucide-react";
import EmptyState from "../components/common/EmptyState";
import { LinkButton } from "../components/common/Button";

export default function NotFound() {
  return (
    <EmptyState
      icon={Compass}
      title="Page not found"
      description="The page you're looking for doesn't exist or has moved."
      action={<LinkButton to="/">Back to dashboard</LinkButton>}
    />
  );
}
