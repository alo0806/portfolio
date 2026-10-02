/* Case-study charts, in plain CSS and HTML: a bar list and a scatter.
   Colors come from the --chart-* tokens (each ≥3:1 on the card), and
   color is never the only cue: venues also have their own shape, and
   estimates are outlined or hollow and labelled. */

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

/* Points placed by percentage over a plain grid, each with its own
   label (`place` says which side it sits on, so neighbours don't
   collide at phone width). The drawing is hidden from screen readers;
   the table under it holds the same numbers. */
function ScatterChart({ chart }) {
  const { x, y, points } = chart
  const at = (axis, v) => ((v - axis.min) / (axis.max - axis.min)) * 100
  const fmt = (axis, v) => `${axis.prefix ?? ''}${v}`
  const toneName = Object.fromEntries(
    (chart.legend ?? []).filter((item) => !item.est).map((item) => [item.tone, item.label]),
  )
  return (
    <figure className="bar-chart scatter">
      <figcaption className="bar-chart__title">{chart.title}</figcaption>
      <Legend items={chart.legend} />
      <div className="scatter__frame" aria-hidden="true">
        <span className="scatter__axis">{y.label}</span>
        <div className="scatter__plot">
          {y.ticks.map((t) => (
            <span key={t} className="scatter__grid" style={{ '--p': at(y, t) }}>
              <span className="scatter__tick">{fmt(y, t)}</span>
            </span>
          ))}
          {x.ticks.map((t) => (
            <span key={t} className="scatter__tick scatter__tick--x" style={{ '--p': at(x, t) }}>
              {fmt(x, t)}
            </span>
          ))}
          {points.map((p) => (
            <span key={p.label} className="scatter__point" style={{ '--x': at(x, p.x), '--y': at(y, p.y) }}>
              <Mark tone={p.tone} est={p.est} />
              <span className="scatter__label" data-place={p.place ?? 'right'}>
                {p.label}
              </span>
            </span>
          ))}
        </div>
        <span className="scatter__axis scatter__axis--x">{x.label}</span>
      </div>
      {chart.note ? <p className="bar-chart__note">{chart.note}</p> : null}
      <details className="chart-data">
        <summary>Show the data</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">Event</th>
              <th scope="col">Venue</th>
              <th scope="col">{x.name}</th>
              <th scope="col">{y.name}</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.label}>
                <th scope="row">{p.label}</th>
                <td>{toneName[p.tone]}</td>
                <td className="num">
                  {x.prefix}
                  {p.x.toFixed(2)}
                  {p.est ? ' (est.)' : ''}
                </td>
                <td className="num">{p.y}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  )
}

export default function Chart({ chart }) {
  return chart.type === 'scatter' ? <ScatterChart chart={chart} /> : <BarChart chart={chart} />
}
