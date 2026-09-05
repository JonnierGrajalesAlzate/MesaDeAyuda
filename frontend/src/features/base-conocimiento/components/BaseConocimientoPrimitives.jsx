const BADGE_TONES = {
  slate: "bg-slate-100 text-slate-600",
  blue: "bg-blue-100 text-blue-700",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700"
};
export function Badge({
  children,
  tone = "slate"
}) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${BADGE_TONES[tone]}`}>
      {children}
    </span>;
}
