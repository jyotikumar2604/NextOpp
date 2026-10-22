import Modal from "../common/Modal";
import { Button } from "../common/Button";
import { useApp } from "../../context/AppContext";

/**
 * Shown after the student opens an external application page.
 * We never assume they applied: tracking only happens on their explicit confirmation.
 */
export default function ApplyConfirmDialog() {
  const { applyTarget, confirmApplied, cancelApply } = useApp();
  return (
    <Modal
      open={!!applyTarget}
      onClose={cancelApply}
      title="Did you submit your application?"
      description={
        applyTarget
          ? `We opened the application page for "${applyTarget.title}" at ${applyTarget.organization}. Only add it to your tracker if you actually applied.`
          : ""
      }
      footer={
        <>
          <Button variant="secondary" onClick={cancelApply}>Not yet</Button>
          <Button onClick={confirmApplied}>Yes, I applied</Button>
        </>
      }
    />
  );
}
