import { toast } from "../vendor/sonner/index.mjs";

let dialogPresenter = null;
let dialogActive = false;
const dialogQueue = [];

function processDialogQueue() {
  if (dialogActive || !dialogPresenter || !dialogQueue.length) return;

  dialogActive = true;
  const request = dialogQueue.shift();

  Promise.resolve(dialogPresenter(request.options))
    .then(request.resolve)
    .catch(() => request.resolve({ isConfirmed: false, value: undefined }))
    .finally(() => {
      dialogActive = false;
      processDialogQueue();
    });
}

export function registerAlertDialogPresenter(presenter) {
  dialogPresenter = presenter;
  processDialogQueue();

  return () => {
    if (dialogPresenter === presenter) dialogPresenter = null;
  };
}

function openDialog(options) {
  return new Promise(resolve => {
    dialogQueue.push({ options, resolve });
    processDialogQueue();
  });
}

function showToast(options) {
  const type = ["success", "error", "warning", "info"].includes(options.icon)
    ? options.icon
    : options.icon === "question"
      ? "info"
      : "message";
  const title = options.title || options.text || "Notificación";
  const description = options.title ? options.text : undefined;
  const duration = Number.isFinite(options.timer)
    ? options.timer
    : type === "success"
      ? 3200
      : 5000;

  toast[type](title, {
    description,
    duration,
    id: options.id
  });

  return Promise.resolve({
    isConfirmed: true,
    value: undefined
  });
}

function fire(options = {}) {
  const normalizedOptions = typeof options === "string"
    ? { title: options }
    : options;

  if (normalizedOptions.showCancelButton || normalizedOptions.input) {
    return openDialog(normalizedOptions);
  }

  return showToast(normalizedOptions);
}

const alertService = { fire };

export default alertService;
