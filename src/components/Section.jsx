import { useEffect, useRef } from 'react'
import { useSectionRegistry } from '../context/sectionContexts'

/* Registers itself with the observer on mount. Its accent is looked up in
   tokens.css by id, so a new section is one component plus one CSS rule. */

export default function Section({ id, labelledBy, className = '', children }) {
  const ref = useRef(null)
  const register = useSectionRegistry()

  useEffect(() => register(id, ref.current), [register, id])

  return (
    <section
      id={id}
      ref={ref}
      className={`section ${className}`.trim()}
      aria-labelledby={labelledBy}
    >
      {children}
    </section>
  )
}
