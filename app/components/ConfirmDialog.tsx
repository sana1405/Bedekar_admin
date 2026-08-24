"use client";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-card confirm-card" onClick={event => event.stopPropagation()}>
        <div className="modal-header compact-header">
          <div>
            <p className="eyebrow">CONFIRMATION</p>
            <h2>{title}</h2>
          </div>
          <button className="close-button" type="button" onClick={onCancel} aria-label="Close">×</button>
        </div>

        <div className="modal-body confirm-body">
          <p>{message}</p>
        </div>

        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onCancel} disabled={loading}>
            {cancelText}
          </button>
          <button
            type="button"
            className={destructive ? "danger-button" : "gold"}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Processing…" : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
