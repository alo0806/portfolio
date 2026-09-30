/* "Has this session already seen the intro?" Storage can throw (private
   modes, blocked site data); if it does, the intro simply plays again. */

const KEY = 'astnlo:intro-seen'

export function hasSeenIntro() {
  try {
    return window.sessionStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function markIntroSeen() {
  try {
    window.sessionStorage.setItem(KEY, '1')
  } catch {
    // Not persisted; harmless.
  }
}

/* An arrival cue ('iris', 'return') describes how you got to a page, not
   the page itself. The browser keeps navigation state across reloads, so
   once a page has used its cue it's cleared from the history entry —
   otherwise a reload would replay an arrival that never happened. The
   router keeps its own state under `usr`; only our field changes. */
export function clearEntranceCue() {
  const state = window.history.state
  if (!state?.usr?.entrance) return
  window.history.replaceState({ ...state, usr: { ...state.usr, entrance: null } }, '')
}
