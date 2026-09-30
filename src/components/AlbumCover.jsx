import './covers.css'
import './AlbumCover.css'

/* A square album cover. If content.js gives the project an image it's
   used; otherwise the cover is set in type over the palette gradient,
   in one of three layouts so no two covers look alike. */
export default function AlbumCover({ title, number, cover, image }) {
  if (image?.src) {
    return (
      <div className="cover cover--image">
        <img src={image.src} alt={image.alt ?? ''} loading="lazy" decoding="async" />
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
