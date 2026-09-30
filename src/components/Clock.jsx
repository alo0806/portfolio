import useClock from '../hooks/useClock'

const formatter = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZoneName: 'short',
})

/* Local time, in mono. Deliberately not a live region — announcing every
   second would be noise for screen readers. */
export default function Clock({ className = '' }) {
  const now = useClock()
  return (
    <p className={`mono clock ${className}`.trim()}>
      <span className="sr-only">Local time: </span>
      <time dateTime={now.toISOString()}>{formatter.format(now)}</time>
    </p>
  )
}
