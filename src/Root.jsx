import { Outlet } from 'react-router-dom'
import Cursor from './components/Cursor'
import IrisProvider from './components/iris/IrisProvider'
import PlayerProvider from './components/player/PlayerProvider'

/* Everything that must outlive a route change: play state, the iris
   overlay (it covers the change) and the cursor. */
export default function Root() {
  return (
    <PlayerProvider>
      <IrisProvider>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Outlet />
        <Cursor />
      </IrisProvider>
    </PlayerProvider>
  )
}
