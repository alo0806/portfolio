const TAG_TONE = {
  'Side project': 'accent',
  Internship: 'secondary',
}

export default function ProjectCard({ title, tag, description, metrics, fill }) {
  return (
    <article className="project">
      <div className="project__image" style={{ background: `var(${fill})` }} aria-hidden="true">
        <span className="mono project__image-note">Image</span>
      </div>
      <div className="project__body">
        <div className="project__heading">
          <h3 className="project__title">{title}</h3>
          <span className="mono project__tag" data-tone={TAG_TONE[tag] ?? 'accent'}>
            {tag}
          </span>
        </div>
        <p className="project__desc">{description}</p>
        <dl className="project__metrics">
          {metrics.map(({ label, value }) => (
            <div key={label} className="project__metric">
              <dt className="mono">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  )
}
