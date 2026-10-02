/* Case-study charts: a bar list in plain CSS and HTML, and Chart.js
   charts for the pricing case study (loaded only there). Colors come
   from the --chart-* tokens (each ≥3:1 on the card), and color is never
   the only cue: venues also have their own shape, and estimates are
   outlined, pale or hollow and labelled. */
import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../lib/motion'

const SHAPES = {
  frat: <rect x="1.2" y="1.2" width="9.6" height="9.6" />,
  roof: <polygon points="6,0.8 11.4,11 0.6,11" />,
  yard: <circle cx="6" cy="6" r="5.2" />,
}

/* A venue's shape, or a swatch in a bar's own fill for everything else. */
function Mark({ tone, est }) {
  if (SHAPES[tone]) {
    return (
      <svg
        className="chart-mark"
        data-tone={tone}
        data-est={est ? 'true' : undefined}
        viewBox="0 0 12 12"
        aria-hidden="true"
      >
        {SHAPES[tone]}
      </svg>
    )
  }
  return <span className="chart-swatch" data-tone={tone} data-est={est ? 'true' : undefined} aria-hidden="true" />
}

function Legend({ items }) {
  if (!items?.length) return null
  return (
    <ul className="chart-legend">
      {items.map((item) => (
        <li key={item.label}>
          <Mark tone={item.tone} est={item.est} />
          {item.label}
        </li>
      ))}
    </ul>
  )
}

/* Bars are scaled against the largest value (a tiny one still shows as a
   sliver). Rows can be split into labelled groups. Screen readers get
   the numbers from the list itself. */
function BarChart({ chart }) {
  const max = Math.max(...chart.bars.map((bar) => bar.value))
  const groups = []
  for (const bar of chart.bars) {
    const last = groups.at(-1)
    if (last && last.name === bar.group) last.bars.push(bar)
    else groups.push({ name: bar.group, bars: [bar] })
  }
  return (
    <figure className="bar-chart" style={chart.valueWidth ? { '--reserve': chart.valueWidth } : undefined}>
      <figcaption className="bar-chart__title">{chart.title}</figcaption>
      <Legend items={chart.legend} />
      {groups.map((group, g) => (
        <div key={g} className="bar-chart__group">
          {group.name ? <p className="bar-chart__group-name">{group.name}</p> : null}
          <dl className="bar-chart__rows">
            {group.bars.map((bar) => (
              <div key={bar.label} className="bar-chart__row" data-highlight={bar.highlight ? 'true' : undefined}>
                <dt>
                  {SHAPES[bar.tone] ? <Mark tone={bar.tone} /> : null}
                  {bar.label}
                </dt>
                <dd>
                  <span
                    className="bar-chart__bar"
                    style={{ '--v': bar.value / max }}
                    data-tone={bar.highlight ? 'hi' : bar.tone}
                    data-est={bar.est ? 'true' : undefined}
                    data-zero={bar.value === 0 ? 'true' : undefined}
                    aria-hidden="true"
                  />
                  <span className="bar-chart__value num">
                    {bar.display ?? `${bar.value}${chart.unit ?? ''}`}
                    {bar.est ? ' est.' : ''}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
      {chart.note ? <p className="bar-chart__note">{chart.note}</p> : null}
    </figure>
  )
}

const VENUE = { frat: 'Frat house', roof: 'Rooftop', yard: 'Backyard' }
const eventName = (event) => `${event.name} ${event.date}`

/* The numbers behind each Chart.js chart, as a table: the canvas is one
   picture to a screen reader, so this is its text version. */
function chartTable(chart) {
  switch (chart.kind) {
    case 'scatter':
      return {
        head: ['Event', 'Venue', 'Average price paid', 'Presales'],
        rows: chart.events.map((e) => [eventName(e), VENUE[e.venue], `$${e.price.toFixed(2)}${e.est ? ' (est.)' : ''}`, e.sold]),
      }
    case 'cumulative':
      return {
        head: ['Event', ...['10', '9', '8', '7', '6', '5', '4', '3', '2', '1'].map((d) => `${d} days out`), 'Event day'],
        rows: chart.events.map((e) => [eventName(e), ...e.cum.map((v) => `${v}%`)]),
      }
    case 'perTicket':
      return {
        head: ['Event', 'Venue', 'Pricing', 'Average paid per ticket'],
        rows: [...chart.events]
          .sort((a, b) => b.price - a.price)
          .map((e) => [eventName(e), VENUE[e.venue], e.pricing, `$${e.price.toFixed(2)}${e.est ? ' (est.)' : ''}`]),
      }
    case 'venue':
      return { head: ['Venue', 'Average presales'], rows: chart.bars.map((bar) => [bar.label, bar.value]) }
    default:
      return { head: ['Day', 'Purchases'], rows: chart.bars.map((bar) => [bar.name ?? bar.label, bar.value]) }
  }
}

const VENUE_LEGEND = [
  { tone: 'frat', label: 'Frat house' },
  { tone: 'roof', label: 'Rooftop' },
  { tone: 'yard', label: 'Backyard' },
]

/* A Chart.js chart (the pricing case study). Chart.js arrives in its own
   chunk, fetched only when one of these mounts, and each chart draws the
   first time it's scrolled into view so its entry animation is seen
   (no animation under reduced motion). It redraws, still, when the
   theme changes. */
function ChartJsFigure({ chart }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    let lib = null
    let instance = null
    let visible = false
    let alive = true
    const draw = (animate) => {
      if (!lib || !visible || !alive) return
      instance?.destroy()
      instance = lib.drawChart(canvas, chart, { animate })
    }
    // The chart's type is drawn on a canvas, so wait for the font too.
    Promise.all([import('./pricingCharts'), document.fonts?.load('12px "Bricolage Grotesque"')]).then(([module]) => {
      lib = module
      draw(!prefersReducedMotion())
    })
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        visible = true
        draw(!prefersReducedMotion())
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    io.observe(canvas)
    const themeWatch = new MutationObserver(() => draw(false))
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => {
      alive = false
      io.disconnect()
      themeWatch.disconnect()
      instance?.destroy()
    }
  }, [chart])

  const table = chartTable(chart)
  return (
    <figure className="bar-chart chartjs" data-kind={chart.kind}>
      <figcaption className="bar-chart__title">{chart.title}</figcaption>
      {chart.kind === 'perTicket' ? (
        <Legend items={[...VENUE_LEGEND, { tone: 'muted', est: true, label: 'Pale: estimate' }]} />
      ) : null}
      <div className="chartjs__canvas">
        <canvas ref={canvasRef} role="img" aria-label={`${chart.title}. The numbers are in the table below.`} />
      </div>
      {chart.note ? <p className="bar-chart__note">{chart.note}</p> : null}
      <details className="chart-data">
        <summary>Show the data</summary>
        <div className="chart-data__scroll">
          <table>
            <thead>
              <tr>
                {table.head.map((cell) => (
                  <th key={cell} scope="col">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map(([first, ...rest]) => (
                <tr key={first}>
                  <th scope="row">{first}</th>
                  {rest.map((cell, k) => (
                    <td key={k} className={typeof cell === 'number' || /^[$\d]/.test(cell) ? 'num' : undefined}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  )
}

export default function Chart({ chart }) {
  return chart.type === 'chartjs' ? <ChartJsFigure chart={chart} /> : <BarChart chart={chart} />
}
