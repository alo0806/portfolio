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
      { path: '*', element: <Navigate to="/work" replace /> },
    ],
  },
]
