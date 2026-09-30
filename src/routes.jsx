import { Navigate } from 'react-router-dom'
import IntroRoute from './IntroRoute'
import MainLayout from './layout/MainLayout'
import AboutPage from './pages/AboutPage'
import PlaygroundPage from './pages/PlaygroundPage'
import WorkPage from './pages/WorkPage'
import Root from './Root'

/* Used with createBrowserRouter (a data router), which the view
   transitions on the EXPLORE links require. */
export const routes = [
  {
    element: <Root />,
    children: [
      { path: '/', element: <IntroRoute /> },
      {
        element: <MainLayout />,
        children: [
          { path: '/work', element: <WorkPage /> },
          { path: '/about', element: <AboutPage /> },
          { path: '/playground', element: <PlaygroundPage /> },
        ],
      },
      // Dev only: a panel to hear every sound. `import.meta.env.DEV` is
      // false in production builds, so this route (and its code) is dropped.
      ...(import.meta.env.DEV
        ? [
            {
              path: '/sounds',
              lazy: async () => ({ Component: (await import('./dev/SoundLab')).default }),
            },
          ]
        : []),
      { path: '*', element: <Navigate to="/work" replace /> },
    ],
  },
]
