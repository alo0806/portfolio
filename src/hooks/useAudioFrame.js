import { useEffect } from 'react'
import { onAudioFrame } from '../sound/analysis'

/* Hands `paint(element, frame)` every analysis frame while music is
   audible, and `paint(element, null)` when it stops. `paint` should be
   defined outside the component (stable), and write styles directly. */
export default function useAudioFrame(ref, paint) {
  useEffect(() => {
    const element = ref.current
    if (!element) return undefined
    return onAudioFrame((frame) => paint(element, frame))
  }, [ref, paint])
}
