/**
 * Full-page or inline spinner — gold accent on dark background.
 */
export default function Loader({ inline = false, label = 'Loading…' }) {
  const wrap = inline
    ? 'flex justify-center py-12'
    : 'min-h-[50vh] flex flex-col items-center justify-center gap-5';

  return (
    <div className={wrap} role="status" aria-live="polite" aria-label={label}>
      {/* Outer ring */}
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full border border-white/5" />
        <div
          className="absolute inset-0 animate-spin rounded-full border-2 border-transparent"
          style={{ borderTopColor: '#d4af37', borderRightColor: 'rgba(212,175,55,0.2)' }}
        />
        {/* Inner dot */}
        <div className="absolute inset-[18px] rounded-full bg-luxury-gold/20" />
      </div>
      {!inline && (
        <p className="font-sans text-sm tracking-widest text-white/30 uppercase">{label}</p>
      )}
    </div>
  );
}
