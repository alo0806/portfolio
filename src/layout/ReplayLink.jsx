import { Link } from 'react-router-dom'
import { useIris } from '../components/iris/irisContext'

/* Back to the intro regardless of the session flag: the route reads
   `replay` from navigation state and skips its "already seen" redirect. */
export default function ReplayLink({ onNavigate }) {
  const { cover } = useIris()

  return (
    <Link
      to="/"
      state={{ replay: true }}
      className="replay-link"
      onClick={(event) => {
        event.preventDefault()
        onNavigate?.()
        cover({ to: '/', state: { replay: true }, color: '--indigo' })
      }}
    >
      <span className="replay-link__icon" aria-hidden="true">
        ↺
      </span>{' '}
      back to the record
    </Link>
  )
}
