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
