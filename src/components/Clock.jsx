import useClock from '../hooks/useClock'

const FORMATS = {
  full: new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  }),
  compact: new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  }),
}

/* Local time, in mono. Deliberately not a live region — announcing every
   second would be noise for screen readers. */
export default function Clock({ className = '', format = 'full' }) {
  const now = useClock()
  return (
    <p className={`num clock ${className}`.trim()}>
      <span className="sr-only">Local time: </span>
      <time dateTime={now.toISOString()}>{FORMATS[format].format(now)}</time>
    </p>
  )
}
