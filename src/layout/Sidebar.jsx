import { Link } from 'react-router-dom'
import Clock from '../components/Clock'
import LogoMark from '../components/LogoMark'
import Mascot from '../components/Mascot'
import Explore from './Explore'
import Outbound from './Outbound'
import ReplayLink from './ReplayLink'

export default function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Site">
      <div className="sidebar__intro">
        <Link to="/work" viewTransition className="sidebar__brand" aria-label="Austin Lo — home">
          <LogoMark />
        </Link>
        <p className="sidebar__name">Austin Lo</p>
        <p className="mono sidebar__sub">Cognitive Science @ UCLA</p>
        <p className="sidebar__bio">
          Placeholder. I design in Figma and build in React — interfaces that
          feel considered from the first pixel to the last line of CSS.
        </p>
      </div>

      <Explore />
      <Outbound />

      <div className="sidebar__meta">
        <ReplayLink />
        <Clock />
      </div>

      <Mascot />
    </aside>
  )
}
