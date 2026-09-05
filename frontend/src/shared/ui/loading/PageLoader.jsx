import { useEffect, useState } from "react";
import logo from "../../../assets/logo2.png";

export default function PageLoader({
  label = "Cargando",
  size = 112,
  ink = "#dff3ff",
  duration = "2.1s",
  className = "",
  messageInterval = 1500,
}) {
  const messages = Array.isArray(label) ? label : [label];
  const messagesKey = messages.join("|");
  const [step, setStep] = useState(0);
  const [prevMessagesKey, setPrevMessagesKey] = useState(messagesKey);

  if (messagesKey !== prevMessagesKey) {
    setPrevMessagesKey(messagesKey);
    setStep(0);
  }

  const currentLabel = messages[Math.min(step, messages.length - 1)];

  useEffect(() => {
    if (step >= messages.length - 1) return undefined;
    const timer = setTimeout(() => setStep(value => value + 1), messageInterval);
    return () => clearTimeout(timer);
  }, [step, messages.length, messageInterval]);

  const mask = { maskImage: `url(${logo})`, WebkitMaskImage: `url(${logo})` };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={currentLabel}
      className={`fixed inset-0 z-[9999] grid place-items-center bg-[#0076e3] ${className}`}
    >
      <div
        className="flex flex-col items-center gap-6"
        style={{ "--pl-ink": ink, "--pl-dur": duration }}
      >
        <div className="relative" style={{ width: size, height: size }}>
          {/* icono apagado */}
          <div
            className="pl-mask absolute inset-0 bg-[rgba(255,255,255,0.28)]"
            style={mask}
          />
          {/* icono pintándose de abajo hacia arriba */}
          <div className="pl-mask pl-fill absolute inset-0" style={mask} />
        </div>

        <div className="flex items-center gap-[7px]">
          <span className="pl-dot h-[5px] w-[5px] rounded-full bg-[#dff3ff]" />
          <span
            className="pl-dot h-[5px] w-[5px] rounded-full bg-[#dff3ff]"
            style={{ animationDelay: "0.2s" }}
          />
          <span
            className="pl-dot h-[5px] w-[5px] rounded-full bg-[#dff3ff]"
            style={{ animationDelay: "0.4s" }}
          />
        </div>

        <div className="pl-label font-mono text-xs uppercase tracking-[0.12em] text-white">
          {currentLabel}
        </div>
      </div>
    </div>
  );
}
