export default function StatsCard({ title, value, subtitle }) {
  return (
    <div className="rounded-xl border border-luxury-border bg-luxury-surface/60 p-6 shadow-gold">
      <p className="font-sans text-xs uppercase tracking-wider text-luxury-muted">{title}</p>
      <p className="mt-2 font-display text-3xl text-white">{value}</p>
      {subtitle && <p className="mt-1 font-sans text-xs text-luxury-golddim">{subtitle}</p>}
    </div>
  );
}
