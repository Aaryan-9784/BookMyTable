export default function ConfirmModal({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel, loading }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-2xl p-7"
        style={{
          background: 'rgba(18,18,18,0.95)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(212,175,55,0.15)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        {/* Icon */}
        <div
          className="mb-5 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <svg className="h-5 w-5 text-red-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        <h2 className="font-display text-2xl font-light text-white">{title}</h2>
        <p className="mt-2 font-sans text-sm leading-relaxed text-white/40">{message}</p>

        {/* Divider */}
        <div className="my-6 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.12), transparent)' }} />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-full border px-5 py-2.5 font-sans text-sm text-white/50 transition-all hover:text-white disabled:opacity-40"
            style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          >
            Keep reservation
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-full px-5 py-2.5 font-sans text-sm font-medium text-white transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-50"
            style={{
              background: 'rgba(185,28,28,0.7)',
              border: '1px solid rgba(239,68,68,0.3)',
              boxShadow: loading ? 'none' : '0 0 20px rgba(239,68,68,0.15)',
            }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Cancelling…
              </span>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
