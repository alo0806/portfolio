import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles/tokens.css'
import './styles/global.css'
import { routes } from './routes.jsx'

const router = createBrowserRouter(routes)

/* When a page switch starts before the previous one has finished, the
   browser skips the older view transition and rejects its promises. The
   router starts those transitions and doesn't observe the rejection, so
   it would surface as an "uncaught" error on every rapid click. That one
   case is expected and harmless; everything else still reports. */
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason
  if (
    reason instanceof DOMException &&
    (reason.name === 'InvalidStateError' || reason.name === 'AbortError') &&
    /transition/i.test(reason.message)
  ) {
    event.preventDefault()
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
