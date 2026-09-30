import { useSyncExternalStore } from 'react'

/* Light / dark, stored per visitor. The first paint is handled by a tiny
   inline script in index.html (so there's no flash of the wrong theme);
   this module keeps <html data-theme> and every toggle in sync after. */

const KEY = 'astnlo:theme'
const SYSTEM_DARK = '(prefers-color-scheme: dark)'

export function getTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

function storedTheme() {
  try {
    const value = window.localStorage.getItem(KEY)
    return value === 'dark' || value === 'light' ? value : null
  } catch {
    return null
  }
}

function apply(theme) {
  document.documentElement.dataset.theme = theme
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#15141B' : '#F4F3EF')
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

  // Until someone chooses, follow the system setting live.
  const system = window.matchMedia(SYSTEM_DARK)
  const onSystem = (event) => {
    if (!storedTheme()) apply(event.matches ? 'dark' : 'light')
  }
  system.addEventListener('change', onSystem)

  return () => {
    observer.disconnect()
    system.removeEventListener('change', onSystem)
  }
}

export function useTheme() {
  return useSyncExternalStore(subscribe, getTheme, () => 'light')
}
