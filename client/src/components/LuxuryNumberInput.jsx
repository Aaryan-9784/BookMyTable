import { useState } from 'react';

/**
 * LuxuryNumberInput — Custom number input with sleek theme-matched Up/Down arrow spinners.
 * Replaces native browser white rectangular spin buttons.
 */
export default function LuxuryNumberInput({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  placeholder = '0',
  className = '',
  disabled = false,
  required = false,
  prefix,
}) {
  const numValue = value === '' || value === null || value === undefined ? '' : Number(value);

  const handleIncrement = () => {
    if (disabled) return;
    const current = numValue === '' ? (min !== undefined ? min : 0) : numValue;
    const next = current + step;
    if (max !== undefined && next > max) return;
    onChange(next);
  };

  const handleDecrement = () => {
    if (disabled) return;
    const current = numValue === '' ? (min !== undefined ? min : 0) : numValue;
    const next = current - step;
    if (min !== undefined && next < min) return;
    onChange(next);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      onChange('');
      return;
    }
    const parsed = Number(val);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  return (
    <div
      className={`relative flex items-center w-full rounded-xl border bg-black/40 transition-all duration-200 focus-within:border-luxury-gold/60 focus-within:shadow-[0_0_16px_rgba(212,175,55,0.15)] ${className}`}
      style={{ borderColor: 'rgba(255,255,255,0.12)' }}
    >
      {prefix && (
        <span className="pl-3.5 font-sans text-xs font-semibold text-luxury-gold select-none">
          {prefix}
        </span>
      )}
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="w-full bg-transparent px-4 py-2.5 font-sans text-sm font-semibold text-white outline-none placeholder:text-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      {/* Custom Luxury Up / Down Spinner Controls */}
      <div className="flex flex-col border-l border-white/10 pr-1 shrink-0 my-1">
        <button
          type="button"
          tabIndex={-1}
          onClick={handleIncrement}
          disabled={disabled || (max !== undefined && numValue !== '' && numValue >= max)}
          className="flex h-4 w-6 items-center justify-center text-white/40 hover:text-luxury-gold hover:bg-luxury-gold/15 active:scale-90 disabled:opacity-20 rounded-t transition-all"
          title="Increase"
        >
          <svg width="9" height="6" viewBox="0 0 9 6" fill="none">
            <path d="M1.5 4.5L4.5 1.5L7.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          tabIndex={-1}
          onClick={handleDecrement}
          disabled={disabled || (min !== undefined && numValue !== '' && numValue <= min)}
          className="flex h-4 w-6 items-center justify-center text-white/40 hover:text-luxury-gold hover:bg-luxury-gold/15 active:scale-90 disabled:opacity-20 rounded-b transition-all"
          title="Decrease"
        >
          <svg width="9" height="6" viewBox="0 0 9 6" fill="none">
            <path d="M1.5 1.5L4.5 4.5L7.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
