import { useEffect, useRef } from 'react'
import { useEarned, useSectionRegistry } from '../context/sectionContexts'

/* Registers itself with the observer on mount. Its pigment is looked up in
   tokens.css by data-chapter, and data-earned flips once the chapter has
   been reached — which is what reveals its wash and draws its line work. */

export default function Section({
  id,
  labelledBy,
  className = '',
  wash = true,
  children,
}) {
  const ref = useRef(null)
  const register = useSectionRegistry()
  const earned = useEarned().includes(id)

  useEffect(() => register(id, ref.current), [register, id])

  return (
    <section
      id={id}
      ref={ref}
      data-chapter={id}
      data-earned={earned ? 'true' : 'false'}
      className={`section ${className}`.trim()}
      aria-labelledby={labelledBy}
    >
      {wash ? <div className="section__wash" aria-hidden="true" /> : null}
      {children}
    </section>
  )
}
