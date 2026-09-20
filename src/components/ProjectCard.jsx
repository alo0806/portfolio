export default function ProjectCard({ index, title, blurb, tags, status }) {
  return (
    <li className="card">
      <a className="card__link" href="#projects">
        <div className="card__top">
          <span className="card__index">{String(index).padStart(2, '0')}</span>
          {status ? <span className="card__status">{status}</span> : null}
        </div>
        <h3 className="card__title">{title}</h3>
        <p className="card__blurb">{blurb}</p>
        <ul className="card__tags">
          {tags.map((tag) => (
            <li key={tag} className="card__tag">
              {tag}
            </li>
          ))}
        </ul>
      </a>
    </li>
  )
}
