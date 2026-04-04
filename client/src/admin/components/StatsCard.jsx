/* Icon components — clean SVG, no emoji */
function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="7" cy="5.5" r="3" stroke="#d4af37" strokeWidth="1.4" />
      <path d="M1.5 16c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M13 8c1.4 0 2.5 1.1 2.5 2.5M15.5 16c0-2-1-3.5-2.5-4.3" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function BookingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="3" width="14" height="13" rx="2" stroke="#d4af37" strokeWidth="1.4" />
      <path d="M6 1.5v3M12 1.5v3" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M2 7.5h14" stroke="#d4af37" strokeWidth="1.4" />
      <circle cx="6.5" cy="11.5" r="1" fill="#d4af37" />
      <circle cx="9" cy="11.5" r="1" fill="#d4af37" />
      <circle cx="11.5" cy="11.5" r="1" fill="#d4af37" />
    </svg>
  );
}
function RestaurantsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M4 2v6c0 1.4 1.1 2.5 2.5 2.5V16" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M6.5 2v4" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12.5 2c0 0 2.5 1.8 2.5 5s-2.5 3.5-2.5 3.5V16" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

const META = {
  Users:       { Icon: UsersIcon,       label: 'Total Users'       },
  Bookings:    { Icon: BookingsIcon,    label: 'Total Bookings'    },
  Restaurants: { Icon: RestaurantsIcon, label: 'Total Restaurants' },
};

export default function StatsCard({ title, value }) {
  const { Icon, label } = META[title] ?? { Icon: () => null, label: title };

  return (
    <div
      className="stats-card relative overflow-hidden rounded-2xl p-7"
      style={{
        background: 'linear-gradient(150deg, #1c1c1c 0%, #161616 55%, #131313 100%)',
        border: '1px solid rgba(212,175,55,0.13)',
        boxShadow: '0 4px 40px rgba(0,0,0,0.55)',
      }}
    >
      {/* Top-right ambient glow — intensifies on hover via .stats-glow */}
      <div
        className="stats-glow pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.14) 0%, transparent 70%)' }}
      />

      {/* Header row */}
      <div className="flex items-start justify-between">
        <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-luxury-muted">
          {label}
        </p>
        {/* Icon circle */}
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
          style={{
            background: 'rgba(212,175,55,0.08)',
            border: '1px solid rgba(212,175,55,0.20)',
            boxShadow: '0 0 14px rgba(212,175,55,0.08)',
          }}
        >
          <Icon />
        </div>
      </div>

      {/* Value */}
      <p
        className="mt-5 font-display leading-none"
        style={{ fontSize: '3.6rem', color: '#f0f0f0', fontWeight: 600 }}
      >
        {value}
      </p>

      {/* Bottom gold strip */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, rgba(212,175,55,0.55) 0%, rgba(212,175,55,0.10) 50%, transparent 100%)',
        }}
      />
    </div>
  );
}
