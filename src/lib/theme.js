import { useSyncExternalStore } from 'react'

/* Light / dark, stored per visitor. Light is the default; dark only once
   chosen. The first paint is handled by a tiny inline script in
   index.html (so there's no flash of the wrong theme); this module keeps
   <html data-theme> and every toggle in sync after. */

const KEY = 'astnlo:theme'

export function getTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

// The browser's theme-color stays the record's indigo in both themes
// (set in index.html), so only the attribute changes here.
function apply(theme) {
  document.documentElement.dataset.theme = theme
}

/* An explicit choice, remembered from now on. */
export function setTheme(theme) {
  apply(theme)
  try {
    window.localStorage.setItem(KEY, theme)
  } catch {
    // Not remembered next visit; harmless.
  }
}

function subscribe(callback) {
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

export function useTheme() {
  return useSyncExternalStore(subscribe, getTheme, () => 'light')
}
