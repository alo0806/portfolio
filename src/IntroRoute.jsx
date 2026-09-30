import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import IntroPage from './intro/IntroPage'
import { hasSeenIntro } from './lib/session'

/* "/" shows the intro once per session. The "back to the stars" link
   passes { replay: true } to bypass that. The decision is made once per
   mount, so the intro can't redirect itself away mid-animation. */
export default function IntroRoute() {
  const location = useLocation()
  const [showIntro] = useState(
    () => location.state?.replay === true || !hasSeenIntro(),
  )
  return showIntro ? <IntroPage /> : <Navigate to="/work" replace />
}
