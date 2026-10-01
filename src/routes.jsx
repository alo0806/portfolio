import { Navigate } from 'react-router-dom'
import IntroRoute from './IntroRoute'
import MainLayout from './layout/MainLayout'
import AboutPage from './pages/AboutPage'
import CaseStudyPage from './pages/CaseStudyPage'
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
          { path: '/work/:slug', element: <CaseStudyPage /> },
          { path: '/about', element: <AboutPage /> },
          { path: '/playground', element: <PlaygroundPage /> },
        ],
      },
      // Dev only: a panel to hear every sound, and the mascot review page.
      // `import.meta.env.DEV` is false in production builds, so these routes
      // (and their code) are dropped.
      ...(import.meta.env.DEV
        ? [
            {
              path: '/sounds',
              lazy: async () => ({ Component: (await import('./dev/SoundLab')).default }),
            },
            {
              path: '/mascot',
              lazy: async () => ({ Component: (await import('./dev/MascotLab')).default }),
            },
          ]
        : []),
      { path: '*', element: <Navigate to="/work" replace /> },
    ],
  },
]
