import CoverArt from './CoverArt'
import Media from './work/Media'
import './covers.css'
import './AlbumCover.css'

/* A square album cover. `cover.art` names one of the animated vector
   scenes in CoverArt (the Singles); `motion` is 'hover' on cards. If
   content.js gives the project a cover image or
   video it's used (the video as a muted loop that plays only while it's
   on screen); otherwise the cover is set in type over the palette
   gradient, in one of three layouts so no two covers look alike. The
   card around it carries the title, so the art is decorative. */
export default function AlbumCover({ title, number, cover, motion }) {
  if (cover?.art) {
    return (
      <div className="cover cover--art" data-palette={cover.palette ?? 'sunset'}>
        <CoverArt kind={cover.art} mode={motion} />
      </div>
    )
  }

  if (cover?.video || cover?.image) {
    const item = cover.video
      ? { type: 'video', src: cover.video, poster: cover.poster, ratio: '1/1' }
      : { type: 'image', src: cover.image, ratio: '1/1' }
    return (
      <div className="cover cover--image">
        <Media item={item} decorative className="cover__media" />
      </div>
    )
  }

  const words = title.split(' ')
  const layout = cover?.layout ?? 'stacked'

  return (
    <div className={`cover cover--${layout}`} data-palette={cover?.palette ?? 'sunset'} aria-hidden="true">
      {layout === 'stacked' && (
        <>
          <span className="cover__number">No. {number}</span>
          <span className="cover__stack">
            {words.map((word) => (
              <span key={word}>{word}</span>
            ))}
          </span>
        </>
      )}

      {layout === 'initial' && (
        <>
          <span className="cover__initial">{title.charAt(0)}</span>
          <span className="cover__caption">{title}</span>
        </>
      )}

      {layout === 'framed' && (
        <>
          <span className="cover__ring" />
          <span className="cover__framed-title">{title}</span>
          <span className="cover__number cover__number--bottom">Side {number}</span>
        </>
      )}
    </div>
  )
}
