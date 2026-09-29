import LineArt from './LineArt'
import './Stage.css'

/* The blob's place in a chapter: the chapter's line work with a home
   point at its exact centre. The blob reads [data-blob-home] from the
   active section, so moving a stage moves where the blob lives. */

export default function Stage({ variant, hero = false }) {
  return (
    <div
      className={`stage-rail${hero ? ' stage-rail--hero' : ''}`}
      aria-hidden="true"
    >
      <div className="stage">
        <LineArt variant={variant} />
        <span className="stage__home" data-blob-home="" />
      </div>
    </div>
  )
}
