import { Link } from 'react-router-dom'
import { useIris } from '../components/iris/irisContext'

/* Back to the intro regardless of the session flag: the route reads
   `replay` from navigation state and skips its "already seen" redirect.
   The trip plays the iris backward — this page contracts into a circle
   onto the record (marked data-iris-target on the intro). */
export default function ReplayLink({ onNavigate }) {
  const { reverse } = useIris()

  return (
    <Link
      to="/"
      state={{ replay: true }}
      className="replay-link u-line"
      onClick={(event) => {
        event.preventDefault()
        onNavigate?.()
        reverse({ to: '/', state: { replay: true }, target: '[data-iris-target]' })
      }}
    >
      <span className="replay-link__icon" aria-hidden="true">
        ↺
      </span>{' '}
      back to the record
    </Link>
  )
}
