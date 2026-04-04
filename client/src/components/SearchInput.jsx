/**
 * Search field — leading magnifying glass, optional clear, optional pending indicator.
 */
export default function SearchInput({
  id,
  name,
  value,
  onChange,
  placeholder = 'Search…',
  className = '',
  inputClassName = '',
  /** Hero landing: pill shape on large screens, stacked on mobile */
  variant = 'default',
  disabled = false,
  showClear = true,
  pending = false,
  autoFocus = false,
}) {
  const hasValue = Boolean(value && String(value).trim());
  const showRightControls = pending || (hasValue && showClear);
  const padRight =
    pending && hasValue && showClear ? 'pr-[5.5rem]' : showRightControls ? 'pr-12' : 'pr-3';

  const clear = () => {
    onChange({ target: { value: '' } });
  };

  const variantClass =
    variant === 'hero'
      ? 'min-h-[2.75rem] rounded-xl border-luxury-border/60 bg-luxury-bg/80 sm:min-h-[2.75rem] sm:rounded-full sm:border-0 sm:bg-luxury-bg/40 sm:py-2.5'
      : '';

  return (
    <div className={`relative ${className}`}>
      <span className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-luxury-muted" aria-hidden>
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </span>
      <input
        id={id}
        name={name}
        type="search"
        autoComplete="off"
        autoFocus={autoFocus}
        disabled={disabled}
        value={value}
        onChange={onChange}
        onKeyDown={(e) => {
          if (e.key === 'Escape') clear();
        }}
        placeholder={placeholder}
        className={`h-11 w-full rounded-lg border border-luxury-border bg-luxury-bg py-2 pl-10 text-sm text-white placeholder:text-luxury-muted focus:border-luxury-gold focus:outline-none focus:ring-1 focus:ring-luxury-gold/25 disabled:opacity-50 ${padRight} ${variantClass} ${inputClassName}`}
      />
      {showRightControls && (
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
          {pending && (
            <span className="flex h-8 w-8 items-center justify-center" title="Updating results…">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-luxury-muted border-t-luxury-gold" />
            </span>
          )}
          {hasValue && showClear && (
            <button
              type="button"
              onClick={clear}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-luxury-muted transition hover:bg-luxury-border/50 hover:text-white"
              aria-label="Clear search"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
