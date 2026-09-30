/* Small inline icons. Decorative by default — the button around each
   one carries the accessible label. */

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 20 20',
  'aria-hidden': true,
  focusable: false,
}

export function PlayIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 4.2 L16 10 L6 15.8 Z" fill="currentColor" />
    </svg>
  )
}

export function PauseIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="5.5" y="4.5" width="3" height="11" rx="1" fill="currentColor" />
      <rect x="11.5" y="4.5" width="3" height="11" rx="1" fill="currentColor" />
    </svg>
  )
}

export function PrevIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="5" width="2" height="10" rx="1" fill="currentColor" />
      <path d="M16 5 L7.5 10 L16 15 Z" fill="currentColor" />
    </svg>
  )
}

export function NextIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 5 L12.5 10 L4 15 Z" fill="currentColor" />
      <rect x="14" y="5" width="2" height="10" rx="1" fill="currentColor" />
    </svg>
  )
}

/* ─── Theme ─── */

export function MoonIcon(props) {
  return (
    <svg {...base} {...props}>
      <path
        d="M15.6 12.6A6.6 6.6 0 0 1 7.4 4.4a6.6 6.6 0 1 0 8.2 8.2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SunIcon(props) {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315]
  return (
    <svg {...base} {...props}>
      <circle cx="10" cy="10" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      {rays.map((angle) => (
        <line
          key={angle}
          x1="10"
          y1="2.4"
          x2="10"
          y2="4.2"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          transform={`rotate(${angle} 10 10)`}
        />
      ))}
    </svg>
  )
}

/* ─── Links ─── */

export function EmailIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="2.5" y="4.5" width="15" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 6 10 11l6.5-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

/* The LinkedIn "in" in its rounded square. */
export function LinkedInIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="2" y="2" width="16" height="16" rx="3" fill="currentColor" />
      <g fill="var(--icon-knockout)">
        <rect x="5" y="8.2" width="2.3" height="6.8" rx="0.4" />
        <circle cx="6.15" cy="5.9" r="1.35" />
        <path d="M9.2 8.2h2.2v1a2.6 2.6 0 0 1 2.3-1.2c1.6 0 2.3 1 2.3 2.8V15h-2.3v-3.8c0-.9-.3-1.4-1.1-1.4-.8 0-1.2.6-1.2 1.4V15H9.2V8.2Z" />
      </g>
    </svg>
  )
}

/* GitHub's mark (from GitHub's MIT-licensed Octicons, "mark-github"). */
export function GitHubIcon(props) {
  return (
    <svg {...base} viewBox="0 0 16 16" {...props}>
      <path
        fill="currentColor"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
      />
    </svg>
  )
}

export function ResumeIcon(props) {
  return (
    <svg {...base} {...props}>
      <path
        d="M5 2.5h6.5L15.5 6.5V17a.5.5 0 0 1-.5.5H5a.5.5 0 0 1-.5-.5V3a.5.5 0 0 1 .5-.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M11.5 2.5v4h4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7 10.5h6M7 13.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
