import './pages.css'

export default function PageHead({ number, title }) {
  return (
    <header className="page-head">
      <p className="mono page-head__eyebrow" aria-hidden="true">
        {number} <span className="page-head__of">/ 03</span>
      </p>
      <h1 className="page-head__title">{title}</h1>
    </header>
  )
}
