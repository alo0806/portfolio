export default function LatestLog() {
  return (
    <article className="log" data-surface="dark" aria-labelledby="latest-log-title">
      <div className="log__head">
        <h2 className="mono log__label" id="latest-log-title">
          <span className="log__pulse" aria-hidden="true" />
          Latest log
        </h2>
        <time className="mono log__date" dateTime="2026-09-29">
          Sep 29, 2026
        </time>
      </div>
      <p className="log__body">
        Placeholder. Rebuilt the portfolio from scratch — a starry intro, an iris
        wipe, and a sidebar you can actually navigate.
      </p>
      <a
        className="mono log__all"
        href="#"
        onClick={(event) => event.preventDefault()}
      >
        All logs <span aria-hidden="true">→</span>
      </a>
      <svg className="log__spark" viewBox="0 0 12 12" aria-hidden="true">
        <path d="M6 0 L7.2 4.8 L12 6 L7.2 7.2 L6 12 L4.8 7.2 L0 6 L4.8 4.8 Z" />
      </svg>
    </article>
  )
}
