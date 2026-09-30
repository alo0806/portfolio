import { Link, useLocation } from 'react-router-dom'
import CoverMark from '../components/CoverMark'
import { artist } from '../data/content'
import { prepareTrackClick } from '../lib/trackNav'
import Links from './Links'
import ReplayLink from './ReplayLink'
import Tracklist from './Tracklist'

/* The "artist" panel. */
export default function Sidebar() {
  const { pathname } = useLocation()

  return (
    <aside className="sidebar" aria-label="Artist" data-rm-fade="">
      <div className="sidebar__artist">
        <Link
          to="/work"
          viewTransition
          className="sidebar__brand"
          aria-label={`${artist.name} — home`}
          onClick={() => prepareTrackClick(pathname, '/work')}
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
