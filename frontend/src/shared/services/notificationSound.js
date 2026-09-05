let audioContext;

function getContext() {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioContext) audioContext = new AudioContextClass();
  if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
  return audioContext;
}

function tone(ctx, frequency, startTime, duration, peakGain) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

export function playNotificationSound() {
  try {
    const ctx = getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    tone(ctx, 880, now, 0.16, 0.16);
    tone(ctx, 1318.51, now + 0.11, 0.22, 0.2);
  } catch {
    // El navegador bloqueó la reproducción de audio; se ignora en silencio.
  }
}
