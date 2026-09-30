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
