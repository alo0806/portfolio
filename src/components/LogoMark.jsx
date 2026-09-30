/* A small geometric mark: two overlapping circles and a four-point star.
   Drawn, not an image, so it inherits the tokens. */
export default function LogoMark({ size = 36, className = '' }) {
  return (
    <svg
      className={`logo-mark ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 36 36"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="15" cy="19" r="11" fill="var(--accent)" />
      <circle cx="23" cy="15" r="7.5" fill="var(--secondary)" opacity="0.85" />
      <path
        d="M29 3.5 L30.1 6.9 L33.5 8 L30.1 9.1 L29 12.5 L27.9 9.1 L24.5 8 L27.9 6.9 Z"
        fill="var(--ink)"
      />
    </svg>
  )
}
