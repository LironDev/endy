/**
 * AppLogo — inline SVG chain-link logo mark for use in HomeScreen and other screens.
 * Uses the same two-interlocked-rings design as public/favicon.svg.
 * No external image dependency → works offline + during build.
 */
export function AppLogo({ size = 80 }) {
  const id = 'logo'; // unique prefix for gradient/filter ids

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2d0a5e" />
          <stop offset="100%" stopColor="#150030" />
        </linearGradient>

        <linearGradient id={`${id}-r1`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e9d5ff" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>

        <linearGradient id={`${id}-r2`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>

        {/* Soft outer glow */}
        <filter id={`${id}-glow`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Extra halo behind the rings */}
        <filter id={`${id}-halo`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      {/* Background rounded square */}
      <rect x="1" y="1" width="62" height="62" rx="15" ry="15"
        fill={`url(#${id}-bg)`} />

      {/* Border glow */}
      <rect x="1" y="1" width="62" height="62" rx="15" ry="15"
        fill="none" stroke="#a855f7" strokeWidth="1.2" strokeOpacity="0.45" />

      {/* Purple halo behind rings */}
      <g filter={`url(#${id}-halo)`} opacity="0.5">
        <circle cx="23" cy="32" r="11" fill="#a855f7" />
        <circle cx="41" cy="32" r="11" fill="#7c3aed" />
      </g>

      {/* Chain rings with glow */}
      <g filter={`url(#${id}-glow)`}>
        {/* Left ring */}
        <circle cx="23" cy="32" r="10"
          fill="none" stroke={`url(#${id}-r1)`} strokeWidth="4.5" />

        {/* Right ring */}
        <circle cx="41" cy="32" r="10"
          fill="none" stroke={`url(#${id}-r2)`} strokeWidth="4.5" />

        {/* Interlock overlay: left ring's right arc passes in front of right ring's left arc */}
        {/* Draw the left arc of the left ring on top to simulate chain interlock */}
        <path
          d="M 23,22 A 10,10 0 0,0 23,42"
          fill="none"
          stroke={`url(#${id}-r1)`}
          strokeWidth="5"
          strokeLinecap="butt"
        />
      </g>

      {/* Corner sparkles */}
      <circle cx="11" cy="11" r="1.3" fill="#c084fc" opacity="0.7" />
      <circle cx="53" cy="13" r="0.9" fill="#e9d5ff" opacity="0.55" />
      <circle cx="9"  cy="53" r="0.8" fill="#c084fc" opacity="0.4" />
      <circle cx="55" cy="53" r="1.1" fill="#e9d5ff" opacity="0.5" />
    </svg>
  );
}
