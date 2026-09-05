function ModalFooter({
  onCancel,
  cancelLabel = "Cancelar",
  cancelDisabled = false,
  onConfirm,
  confirmLabel = "Confirmar",
  confirmType = "button",
  confirmDisabled = false,
  confirmTone = "primary"
}) {
  return (
    <footer className="modal-footer">
      <button type="button" onClick={onCancel} disabled={cancelDisabled} className="modal-footer-cancel">
        {cancelLabel}
      </button>
      <button
        type={confirmType}
        onClick={confirmType === "button" ? onConfirm : undefined}
        disabled={confirmDisabled}
        className={`modal-footer-confirm${confirmTone === "danger" ? " modal-footer-confirm--danger" : ""}`}
      >
        {confirmLabel}
      </button>
    </footer>
  );
}

export default ModalFooter;
