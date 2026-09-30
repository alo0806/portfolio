import { Link } from 'react-router-dom'
import { useIris } from '../components/iris/irisContext'

/* Replays the intro regardless of the session flag: the route reads
   `replay` from navigation state and skips its "already seen" redirect. */
export default function ReplayLink({ onNavigate }) {
  const { cover } = useIris()

  return (
    <Link
      to="/"
      state={{ replay: true }}
      className="mono replay-link"
      onClick={(event) => {
        event.preventDefault()
        onNavigate?.()
        cover({ to: '/', state: { replay: true }, color: '--space' })
      }}
    >
      <span className="replay-link__star" aria-hidden="true">
        ✦
      </span>{' '}
      back to the stars
    </Link>
  )
}
