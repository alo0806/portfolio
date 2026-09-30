import { Link } from 'react-router-dom'
import CoverMark from '../components/CoverMark'
import { artist } from '../data/content'
import Links from './Links'
import ReplayLink from './ReplayLink'
import Tracklist from './Tracklist'

/* The "artist" panel. */
export default function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Artist">
      <div className="sidebar__artist">
        <Link
          to="/work"
          viewTransition
          className="sidebar__brand"
          aria-label={`${artist.name} — home`}
        >
          <CoverMark />
        </Link>
        <p className="sidebar__name">{artist.name}</p>
        <p className="sidebar__sub">{artist.subline}</p>
        <p className="sidebar__bio">{artist.bio}</p>
      </div>

      <Tracklist />
      <Links />

      <div className="sidebar__meta">
        <ReplayLink />
      </div>
    </aside>
  )
}
