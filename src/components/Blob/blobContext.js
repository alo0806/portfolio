import { createContext, useContext } from 'react'

export const BlobContext = createContext(null)

export function useBlob() {
  const blob = useContext(BlobContext)
  if (!blob) throw new Error('useBlob must be used inside <BlobProvider>')
  return blob
}
