import { TRACKS } from '../data/tracks'
import './pages.css'

/* Page title with its track line: "Track 1 · 0:42". */
export default function PageHead({ path, title }) {
  const track = TRACKS.find((item) => item.path === path)

  return (
    <header className="page-head">
      {track ? (
        <p className="page-head__track">
          Track {track.number}
          <span className="page-head__dot" aria-hidden="true">
            ·
          </span>
          <span className="num">
            <span className="sr-only">reading time </span>
            {track.time}
          </span>
        </p>
      ) : null}
      <h1 className="page-head__title">{title}</h1>
    </header>
  )
}
