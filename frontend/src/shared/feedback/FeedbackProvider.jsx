import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import logo1Icon from "../../assets/logo1.png";
import { Toaster } from "../vendor/sonner/index.mjs";
import { registerAlertDialogPresenter } from "../services/alertService.js";

function FeedbackIcon({ type = "info" }) {
  if (type === "success") {
    return (
      <span className="feedback-dialog-icon is-success" aria-hidden="true">
        <Check />
      </span>
    );
  }

  if (type === "question") {
    return <img src={logo1Icon} alt="" className="feedback-dialog-logo" aria-hidden="true" />;
  }

  const paths = {
    error: <><path d="M12 8v5" /><path d="M12 16.5v.1" /></>,
    info: <><path d="M12 11v5" /><path d="M12 7.5v.1" /></>,
    warning: <><path d="M12 8v5" /><path d="M12 16.5v.1" /></>
  };

  return (
    <span className={`feedback-dialog-icon is-${type}`} aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        {paths[type] || paths.info}
      </svg>
    </span>
  );
}

export default function FeedbackProvider({ children }) {
  const [request, setRequest] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState("");
  const dialogRef = useRef(null);
  const cancelButtonRef = useRef(null);

  useEffect(() => registerAlertDialogPresenter(options => new Promise(resolve => {
    setInputValue(String(options.inputValue || ""));
    setInputError("");
    setRequest({ options, resolve });
  })), []);

  useEffect(() => {
    if (!request || !dialogRef.current) return undefined;

    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!dialog.open) dialog.showModal();
    requestAnimationFrame(() => cancelButtonRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
    };
  }, [request]);

  const finish = result => {
    const currentRequest = request;
    if (!currentRequest) return;
    setRequest(null);
    currentRequest.resolve(result);
  };

  const cancel = () => finish({
    isConfirmed: false,
    value: undefined
  });

  const confirm = async () => {
    if (!request) return;
    const { options } = request;

    if (options.inputValidator) {
      const validationMessage = await options.inputValidator(inputValue);
      if (validationMessage) {
        setInputError(validationMessage);
        return;
      }
    }

    finish({
      isConfirmed: true,
      value: options.input ? inputValue : true
    });
  };

  const options = request?.options;
  const icon = options?.icon || (options?.input ? "info" : "warning");
  const confirmColor = options?.confirmButtonColor
    || (icon === "error" ? "#dc2626" : "#0076e3");

  return (
    <>
      {children}

      <Toaster
        position="top-right"
        richColors
        closeButton
        expand={false}
        visibleToasts={4}
        gap={10}
        offset="80px"
        mobileOffset="12px"
        containerAriaLabel="Notificaciones de Soporte LG"
        toastOptions={{
          duration: 4500,
          classNames: {
            toast: "support-toast",
            title: "support-toast-title",
            description: "support-toast-description",
            closeButton: "support-toast-close"
          }
        }}
      />

      {request && (
        <dialog
          ref={dialogRef}
          className="feedback-dialog"
          aria-labelledby="feedback-dialog-title"
          aria-describedby={options.text ? "feedback-dialog-description" : undefined}
          onCancel={event => {
            event.preventDefault();
            cancel();
          }}
          onClick={event => {
            if (event.target === event.currentTarget) cancel();
          }}
        >
          <div
            className="feedback-dialog-card"
            style={options.accentColor ? { "--feedback-accent-bg": options.accentColor } : undefined}
          >
            <FeedbackIcon type={icon} />

            <div className="feedback-dialog-copy">
              <span className="azure-page-eyebrow">Soporte LG</span>
              <h2 id="feedback-dialog-title">{options.title || "Confirmar acción"}</h2>
              {options.text && (
                <p id="feedback-dialog-description">{options.text}</p>
              )}
            </div>

            {options.input && (
              <label className="feedback-dialog-field">
                <span>{options.inputLabel || "Información adicional"}</span>
                {options.input === "textarea" ? (
                  <textarea
                    value={inputValue}
                    placeholder={options.inputPlaceholder}
                    rows={4}
                    onChange={event => {
                      setInputValue(event.target.value);
                      setInputError("");
                    }}
                  />
                ) : (
                  <input
                    type={options.input}
                    value={inputValue}
                    placeholder={options.inputPlaceholder}
                    onChange={event => {
                      setInputValue(event.target.value);
                      setInputError("");
                    }}
                  />
                )}
                {inputError && <small role="alert">{inputError}</small>}
              </label>
            )}

            <div className="feedback-dialog-actions">
              <button
                ref={cancelButtonRef}
                type="button"
                className="feedback-dialog-cancel"
                onClick={cancel}
              >
                {options.cancelButtonText || "Cancelar"}
              </button>
              <button
                type="button"
                className="feedback-dialog-confirm"
                style={{ "--feedback-confirm-color": confirmColor }}
                onClick={confirm}
              >
                {options.confirmButtonText || "Confirmar"}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}
