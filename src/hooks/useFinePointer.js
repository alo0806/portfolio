import { useEffect, useState } from 'react'

/* True on devices with a precise, hovering pointer (a mouse or trackpad).
   Touch screens get false, which is what turns the custom cursor off. */

const QUERY = '(hover: hover) and (pointer: fine)'

export default function useFinePointer() {
  const [fine, setFine] = useState(
    () => window.matchMedia?.(QUERY).matches ?? false,
  )

  useEffect(() => {
    const mql = window.matchMedia(QUERY)
    const onChange = (event) => setFine(event.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return fine
}
