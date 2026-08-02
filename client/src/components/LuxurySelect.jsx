import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * LuxurySelect — A reusable, theme-consistent dropdown menu component.
 * Uses React Portal to escape overflow/z-index traps in modals and complex layouts.
 *
 * Props:
 * - value: string | number
 * - onChange: (value: string | number) => void
 * - options: Array<{ value: string|number, label: string, sublabel?: string, icon?: React.ReactNode }> | Array<string|number>
 * - placeholder?: string
 * - disabled?: boolean
 * - className?: string
 * - size?: 'sm' | 'md' | 'lg'
 */
export default function LuxurySelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select option...',
  disabled = false,
  className = '',
  size = 'md',
}) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  // Normalize options list into objects { value, label, sublabel, icon }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: opt.value,
        label: opt.label !== undefined ? opt.label : String(opt.value),
        sublabel: opt.sublabel,
        icon: opt.icon,
      };
    }
    return { value: opt, label: String(opt), sublabel: undefined, icon: undefined };
  });

  const selectedOpt = normalizedOptions.find((o) => String(o.value) === String(value));

  // Dynamically calculate floating position of portal menu under trigger button
  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const showAbove = spaceBelow < 220 && rect.top > 220;

    setMenuStyle({
      position: 'fixed',
      left: rect.left,
      width: rect.width,
      zIndex: 99999,
      ...(showAbove
        ? { bottom: window.innerHeight - rect.top + 6, maxHeight: Math.min(260, rect.top - 20) }
        : { top: rect.bottom + 6, maxHeight: Math.min(260, spaceBelow - 20) }),
    });
  };

  useLayoutEffect(() => {
    if (open) updatePosition();
  }, [open]);

  // Handle outside click & scroll/resize repositioning
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    const handleScrollOrResize = (e) => {
      // If scroll happens outside the menu itself, close or update position
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      setOpen(false);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  // Sizing styles
  const sizeCls = {
    sm: 'py-1.5 px-3 text-xs min-h-[34px]',
    md: 'py-2.5 px-4 text-sm min-h-[42px]',
    lg: 'py-3 px-4 text-sm min-h-[48px]',
  }[size] || 'py-2.5 px-4 text-sm min-h-[42px]';

  const menu = open ? (
    createPortal(
      <div
        ref={menuRef}
        style={{
          ...menuStyle,
          background: 'linear-gradient(160deg, #1a1a1c 0%, #121214 100%)',
          border: '1px solid rgba(212,175,55,0.3)',
          borderRadius: '14px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.92), 0 0 20px rgba(212,175,55,0.1), inset 0 1px 0 rgba(255,255,255,0.06)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          overflow: 'hidden',
          animation: 'fadeInScale 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="overflow-y-auto p-1.5 space-y-1 max-h-[250px] custom-scrollbar">
          {normalizedOptions.length === 0 ? (
            <div className="px-4 py-3 text-xs text-luxury-muted text-center italic">
              No options available
            </div>
          ) : (
            normalizedOptions.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 font-sans text-xs text-left transition-all duration-150 group ${
                    isSelected ? 'bg-luxury-gold/15 text-luxury-gold font-semibold' : 'text-white/80 hover:bg-luxury-gold/10 hover:text-white'
                  }`}
                  style={{
                    background: isSelected ? 'rgba(212,175,55,0.14)' : undefined,
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    {opt.icon && <span className="shrink-0 text-luxury-gold/80">{opt.icon}</span>}
                    <div className="truncate">
                      <div className={`truncate ${isSelected ? 'text-luxury-gold font-bold' : 'text-white/90 group-hover:text-white'}`}>
                        {opt.label}
                      </div>
                      {opt.sublabel && (
                        <div className="text-[10px] text-luxury-muted truncate mt-0.5 font-normal">
                          {opt.sublabel}
                        </div>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <svg className="h-4 w-4 shrink-0 text-luxury-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>,
      document.body
    )
  ) : null;

  return (
    <div className={`relative w-full ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between rounded-xl border font-sans outline-none transition-all duration-200 ${sizeCls} ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        style={{
          background: 'rgba(0,0,0,0.45)',
          borderColor: open ? 'rgba(212,175,55,0.6)' : 'rgba(255,255,255,0.12)',
          boxShadow: open
            ? '0 0 16px rgba(212,175,55,0.15), 0 0 0 1px rgba(212,175,55,0.2)'
            : '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        <div className="flex items-center gap-2.5 truncate pr-2">
          {selectedOpt?.icon && (
            <span className="shrink-0 text-luxury-gold/80">{selectedOpt.icon}</span>
          )}
          <span className={`truncate ${selectedOpt ? 'text-white font-medium' : 'text-white/30'}`}>
            {selectedOpt ? selectedOpt.label : placeholder}
          </span>
        </div>
        <svg
          className="h-4 w-4 shrink-0 transition-transform duration-200"
          style={{
            color: open ? '#d4af37' : 'rgba(255,255,255,0.4)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {menu}
    </div>
  );
}
