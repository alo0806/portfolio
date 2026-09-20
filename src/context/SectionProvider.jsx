import { useCallback, useEffect, useRef, useState } from 'react'
import { ActiveContext, RegistryContext } from './sectionContexts'

/* One IntersectionObserver watches a thin band across the middle of the
   viewport. Whatever section sits in that band is "current", which gives
   exactly one winner without tie-breaking between tall sections.

   Exception: a section shorter than the band can never intersect it, so a
   short final section would never activate. When the document is scrolled
   to the bottom we hand the active slot to the last section outright. */

const BAND = '-45% 0px -45% 0px'
const BOTTOM_EPSILON = 4

function lastInDocument(nodes) {
  let lastId = null
  let lastTop = -Infinity
  nodes.forEach((el, id) => {
    if (el.offsetTop > lastTop) {
      lastTop = el.offsetTop
      lastId = id
    }
  })
  return lastId
}

export default function SectionProvider({ children }) {
  const [activeId, setActiveId] = useState(null)

  const nodesRef = useRef(new Map())
  const visibleRef = useRef(new Set())
  const atBottomRef = useRef(false)
  const activeRef = useRef(null)
  const observerRef = useRef(null)

  const resolve = useCallback(() => {
    let next = null

    if (atBottomRef.current) {
      next = lastInDocument(nodesRef.current)
    }

    if (!next) {
      const middle = window.innerHeight / 2
      let closest = Infinity
      visibleRef.current.forEach((id) => {
        const el = nodesRef.current.get(id)
        if (!el) return
        const rect = el.getBoundingClientRect()
        const distance = Math.abs(rect.top + rect.height / 2 - middle)
        if (distance < closest) {
          closest = distance
          next = id
        }
      })
    }

    if (next && next !== activeRef.current) {
      activeRef.current = next
      setActiveId(next)
    }
  }, [])

  const getObserver = useCallback(() => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const { id } = entry.target
            if (entry.isIntersecting) visibleRef.current.add(id)
            else visibleRef.current.delete(id)
          })
          resolve()
        },
        { rootMargin: BAND, threshold: 0 },
      )
    }
    return observerRef.current
  }, [resolve])

  const register = useCallback(
    (id, el) => {
      if (!el) return undefined
      const observer = getObserver()
      nodesRef.current.set(id, el)
      observer.observe(el)
      return () => {
        observer.unobserve(el)
        nodesRef.current.delete(id)
        visibleRef.current.delete(id)
      }
    },
    [getObserver],
  )

  useEffect(() => {
    let frame = 0

    const measure = () => {
      frame = 0
      const doc = document.documentElement
      atBottomRef.current =
        window.innerHeight + window.scrollY >= doc.scrollHeight - BOTTOM_EPSILON
      resolve()
    }

    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(measure)
    }

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    schedule()

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [resolve])

  useEffect(() => {
    const observer = observerRef
    return () => observer.current?.disconnect()
  }, [])

  /* The accent lookup itself lives in tokens.css, keyed by this attribute,
     so adding a section means adding one CSS rule — no color in JS. */
  useEffect(() => {
    if (activeId) document.documentElement.dataset.section = activeId
  }, [activeId])

  return (
    <RegistryContext.Provider value={register}>
      <ActiveContext.Provider value={activeId}>
        {children}
      </ActiveContext.Provider>
    </RegistryContext.Provider>
  )
}
