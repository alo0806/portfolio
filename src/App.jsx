import SectionProvider from './context/SectionProvider'
import BlobProvider from './components/Blob/BlobProvider'
import Intro from './components/Intro'
import Nav from './components/Nav'
import ChapterDots from './components/ChapterDots'
import Hero from './components/Hero'
import Projects from './components/Projects'
import About from './components/About'
import Story from './components/Story'
import Contact from './components/Contact'
import Bloom from './components/Bloom'
import Blob from './components/Blob/Blob'

export default function App() {
  return (
    <SectionProvider>
      <BlobProvider>
        <Intro />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Nav />
        <ChapterDots />
        <main id="main">
          <Hero />
          <Projects />
          <About />
          <Story />
          <Contact />
        </main>
        <Bloom />
        <Blob />
      </BlobProvider>
    </SectionProvider>
  )
}
