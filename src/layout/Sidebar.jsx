import { Link, useLocation } from 'react-router-dom'
import Clock from '../components/Clock'
import CoverMark from '../components/CoverMark'
import ThemeToggle from '../components/ThemeToggle'
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

      {/* Pinned to the bottom: the clock, then the divider, then the way
          back and the theme toggle. */}
      <div className="sidebar__foot">
        <Clock className="sidebar__clock" />
        <div className="sidebar__meta sidebar__meta--row">
          <ReplayLink />
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}
