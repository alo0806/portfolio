/* The drawing toy's own small icons. Decorative — each button carries
   its accessible label. */

const base = {
  width: 18,
  height: 18,
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
}

export function CloseIcon() {
  return (
    <svg {...base}>
      <path d="M5.5 5.5 14.5 14.5M14.5 5.5 5.5 14.5" />
    </svg>
  )
}

export function MinusIcon() {
  return (
    <svg {...base}>
      <path d="M5 10h10" />
    </svg>
  )
}

export function PlusIcon() {
  return (
    <svg {...base}>
      <path d="M5 10h10M10 5v10" />
    </svg>
  )
}

export function MirrorIcon() {
  return (
    <svg {...base}>
      <path d="M10 3v14" strokeDasharray="2 2" />
      <path d="M7.5 6 3.5 14h4Z" />
      <path d="M12.5 6l4 8h-4Z" />
    </svg>
  )
}

export function UndoIcon() {
  return (
    <svg {...base}>
      <path d="M7.5 5 4 8.5 7.5 12" />
      <path d="M4 8.5h7.5a4.5 4.5 0 0 1 0 9H9" />
    </svg>
  )
}

export function ClearIcon() {
  return (
    <svg {...base}>
      <path d="M4 6h12M8 6V4.5h4V6M6 6l.8 10.5h6.4L14 6" />
    </svg>
  )
}

export function SaveIcon() {
  return (
    <svg {...base}>
      <path d="M10 3.5v9M6.5 9l3.5 3.5L13.5 9M4 15.5h12" />
    </svg>
  )
}
