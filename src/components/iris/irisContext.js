import { createContext, useContext } from 'react'

export const IrisContext = createContext(null)

export function useIris() {
  const iris = useContext(IrisContext)
  if (!iris) throw new Error('useIris must be used inside <IrisProvider>')
  return iris
}
