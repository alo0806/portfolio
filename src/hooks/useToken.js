import { useEffect, useState } from 'react'
import { readToken } from '../lib/tokens'

/* A token value that follows breakpoint changes. */
export default function useToken(name, fallback) {
  const [value, setValue] = useState(() => readToken(name, fallback))

  useEffect(() => {
    const onResize = () => setValue(readToken(name, fallback))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [name, fallback])

  return value
}
