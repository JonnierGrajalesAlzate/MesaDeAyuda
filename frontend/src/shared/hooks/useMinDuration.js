import { useEffect, useRef, useState } from "react";

export default function useMinDuration(active, minMs = 1000) {
  const [shown, setShown] = useState(active);
  const [prevActive, setPrevActive] = useState(active);
  const startedAtRef = useRef(null);

  if (active !== prevActive) {
    setPrevActive(active);
    if (active) setShown(true);
  }

  useEffect(() => {
    if (active) {
      startedAtRef.current = Date.now();
      return undefined;
    }

    const elapsed = startedAtRef.current === null ? minMs : Date.now() - startedAtRef.current;
    const remaining = Math.max(0, minMs - elapsed);
    const timer = setTimeout(() => {
      startedAtRef.current = null;
      setShown(false);
    }, remaining);
    return () => clearTimeout(timer);
  }, [active, minMs]);

  return shown;
}
