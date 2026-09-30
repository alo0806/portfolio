import AlbumCover from '../components/AlbumCover'

/* A project as an album: cover, title, a plain tag, one line, and three
   metrics — laid out so a recruiter can scan tag and numbers at a glance. */
export default function AlbumCard({ number, title, status, tag, description, metrics, cover, image }) {
  return (
    <article className="album">
      <AlbumCover title={title} number={number} cover={cover} image={image} />
      <div className="album__body">
        <p className="album__tag">{tag}</p>
        <h3 className="album__title">
          {title}
          {status ? <span className="album__status"> ({status})</span> : null}
        </h3>
        <p className="album__desc">{description}</p>
        <dl className="album__metrics">
          {metrics.map(({ label, value }) => (
            <div key={label} className="album__metric">
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  )
}
