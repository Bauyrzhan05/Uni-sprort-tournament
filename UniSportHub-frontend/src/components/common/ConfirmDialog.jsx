import Modal from "./Modal";
import Button from "./Button";

/** Reusable confirmation dialog for destructive actions */
function ConfirmDialog({ isOpen, onClose, onConfirm, title = "Confirm Action", message, loading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-slate-300 text-sm mb-6">{message || "Are you sure you want to proceed? This action cannot be undone."}</p>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>Delete</Button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
