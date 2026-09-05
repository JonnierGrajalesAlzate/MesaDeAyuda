import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./shared/vendor/sonner/styles.css";
import "./index.css";
import App from "./App.jsx";
import FeedbackProvider from "./shared/feedback/FeedbackProvider.jsx";
import SocketProvider from "./shared/realtime/context/SocketContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SocketProvider>
      <FeedbackProvider>
        <App />
      </FeedbackProvider>
    </SocketProvider>
  </StrictMode>
);
