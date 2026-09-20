import Section from './Section'
import './Contact.css'

const SOCIALS = [
  { label: 'GitHub', href: '#' },
  { label: 'Figma', href: '#' },
  { label: 'LinkedIn', href: '#' },
]

export default function Contact() {
  return (
    <Section id="contact" labelledBy="contact-title" className="contact">
      <div className="shell">
        <p className="eyebrow">Contact</p>
        <h2 className="section__title" id="contact-title">
          Let&rsquo;s make something.
        </h2>
        <a className="contact__email" href="mailto:hello@astnlo.com">
          hello@astnlo.com
        </a>
        <footer className="contact__footer">
          <ul className="contact__socials">
            {SOCIALS.map(({ label, href }) => (
              <li key={label}>
                <a className="contact__social" href={href}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <p className="contact__colophon">
            Instrument Serif and DM Sans. Built with React.
          </p>
        </footer>
      </div>
    </Section>
  )
}
