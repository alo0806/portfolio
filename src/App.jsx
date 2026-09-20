import SectionProvider from './context/SectionProvider'
import ColorWash from './components/ColorWash'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Projects from './components/Projects'
import About from './components/About'
import Contact from './components/Contact'
import Blob from './components/Blob/Blob'

export default function App() {
  return (
    <SectionProvider>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <ColorWash />
      <Nav />
      <main id="main">
        <Hero />
        <Projects />
        <About />
        <Contact />
      </main>
      <Blob />
    </SectionProvider>
  )
}
