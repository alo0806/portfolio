import { Outlet } from 'react-router-dom'
import Cursor from './components/Cursor'
import IrisProvider from './components/iris/IrisProvider'

/* Everything that must outlive a route change: the iris overlay (it
   covers the change) and the cursor. */
export default function Root() {
  return (
    <IrisProvider>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Outlet />
      <Cursor />
    </IrisProvider>
  )
}
