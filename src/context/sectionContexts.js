import { createContext, useContext } from 'react'

/* Kept apart from the provider component so the module exports only
   hooks and contexts — a file that mixes components with other exports
   breaks fast refresh. */

export const RegistryContext = createContext(null)
export const ActiveContext = createContext(null)
export const EarnedContext = createContext([])

export function useSectionRegistry() {
  const register = useContext(RegistryContext)
  if (!register) {
    throw new Error('useSectionRegistry must be used inside <SectionProvider>')
  }
  return register
}

export function useActiveSection() {
  return useContext(ActiveContext)
}

/* Section ids in the order they first became active. Once a color is
   earned it stays earned, even when you scroll back past it. */
export function useEarned() {
  return useContext(EarnedContext)
}
