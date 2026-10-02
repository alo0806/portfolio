/* The pricing case study's charts, drawn with Chart.js (the same 4.4.1
   as my original dashboard). This module is only ever loaded with a
   dynamic import() from ChartJsFigure, so Chart.js lands in its own chunk
   and the rest of the site never downloads it. Only the parts these
   charts use are registered, to keep that chunk small. */
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  ScatterController,
  Tooltip,
} from 'chart.js'

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  ScatterController,
  Tooltip,
)

export const VENUE = { frat: 'Frat house', roof: 'Rooftop', yard: 'Backyard' }
const SHAPE = { frat: 'rect', roof: 'triangle', yard: 'circle' }
const GLYPH = { frat: '■', roof: '▲', yard: '●' }
const name = (event) => `${event.name} ${event.date}`

/* The site's tokens, read fresh each draw so the charts follow the theme. */
function palette() {
  const css = getComputedStyle(document.documentElement)
  const v = (token) => css.getPropertyValue(token).trim()
  return {
    frat: v('--chart-frat'),
    roof: v('--chart-roof'),
    yard: v('--chart-yard'),
    hi: v('--chart-hi'),
    muted: v('--chart-muted'),
    ink: v('--ink'),
    mutedInk: v('--muted-ink'),
    line: v('--line'),
    card: v('--card'),
    font: v('--font-display'),
  }
}

function alpha(hex, a) {
  const h = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

/* Shared look: the site's type and colors, quiet grids, a dark tooltip. */
function baseOptions(c, animate) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: animate ? { duration: 700, easing: 'easeOutQuart' } : false,
    layout: { padding: { top: 4, right: 8 } },
    plugins: {
      legend: {
        display: false,
        align: 'start',
        labels: { usePointStyle: true, boxWidth: 8, boxHeight: 8, padding: 14, color: c.mutedInk },
      },
      tooltip: {
        backgroundColor: c.ink,
        titleColor: c.card,
        bodyColor: c.card,
        footerColor: c.card,
        padding: 10,
        cornerRadius: 8,
        boxPadding: 4,
        usePointStyle: true,
        titleFont: { weight: '600' },
      },
    },
  }
}

const axis = (c, extra = {}) => ({
  grid: { color: c.line },
  border: { display: false },
  ticks: { color: c.mutedInk, ...extra.ticks },
  ...(extra.title ? { title: { display: true, text: extra.title, color: c.mutedInk } } : {}),
  ...extra.rest,
})

/* Names beside each scatter point, on the side content.js picks
   (`place`), so neighbours don't collide; a halo keeps them readable
   over grid lines. */
const pointLabels = {
  id: 'pointLabels',
  afterDatasetsDraw(chart, _args, opts) {
    const { ctx } = chart
    ctx.save()
    ctx.font = `500 12px ${opts.font}`
    ctx.textBaseline = 'middle'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 3
    ctx.strokeStyle = opts.halo
    ctx.fillStyle = opts.color
    chart.data.datasets.forEach((dataset, i) => {
      if (!chart.isDatasetVisible(i)) return
      chart.getDatasetMeta(i).data.forEach((point, j) => {
        const raw = dataset.data[j]
        const place = raw.place ?? 'right'
        let { x, y } = point
        let align = 'left'
        if (place.startsWith('right')) x += 12
        if (place === 'right-up') y -= 7
        if (place === 'right-down') y += 7
        if (place === 'left') (x -= 12), (align = 'right')
        if (place === 'above') (y -= 16), (align = 'center')
        if (place === 'below') (y += 16), (align = 'center')
        ctx.textAlign = align
        ctx.strokeText(raw.label, x, y)
        ctx.fillText(raw.label, x, y)
      })
    })
    ctx.restore()
  },
}

function scatter(chart, c, animate) {
  const options = baseOptions(c, animate)
  options.plugins.legend.display = true
  options.plugins.pointLabels = { font: c.font, color: c.ink, halo: c.card }
  options.plugins.tooltip.callbacks = {
    label: (ctx) =>
      `${ctx.raw.label}: ${ctx.raw.y} presales at $${ctx.raw.x.toFixed(2)}${ctx.raw.est ? ' (estimate)' : ''}`,
  }
  options.scales = {
    x: axis(c, { title: 'Average price paid per ticket', ticks: { callback: (v) => `$${v}` }, rest: { min: 8, max: 20 } }),
    y: axis(c, { title: 'Presales', rest: { min: 0, max: 190 } }),
  }
  return {
    type: 'scatter',
    plugins: [pointLabels],
    data: {
      datasets: ['frat', 'roof', 'yard'].map((venue) => ({
        label: VENUE[venue],
        data: chart.events
          .filter((event) => event.venue === venue)
          .map((event) => ({ x: event.price, y: event.sold, label: name(event), place: event.place, est: event.est })),
        pointStyle: SHAPE[venue],
        backgroundColor: c[venue],
        borderColor: c[venue],
        pointBackgroundColor: (ctx) => (ctx.raw?.est ? c.card : c[venue]),
        pointBorderWidth: 2,
        pointRadius: venue === 'roof' ? 9 : 7,
        pointHoverRadius: venue === 'roof' ? 11 : 9,
      })),
    },
    options,
  }
}

function cumulative(chart, c, animate) {
  const options = baseOptions(c, animate)
  options.interaction = { mode: 'index', intersect: false }
  options.plugins.legend.display = true
  options.plugins.legend.position = 'bottom'
  options.plugins.tooltip.callbacks = {
    title: ([item]) => (item.label === 'Event' ? 'Event day' : `${item.label} day${item.label === '1' ? '' : 's'} before`),
    label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}%`,
  }
  options.scales = {
    x: axis(c, { title: 'Days before the event', ticks: { maxRotation: 0, autoSkipPadding: 6 } }),
    y: axis(c, { ticks: { callback: (v) => `${v}%` }, rest: { min: 0, max: 100 } }),
  }
  return {
    type: 'line',
    data: {
      labels: ['10', '9', '8', '7', '6', '5', '4', '3', '2', '1', 'Event'],
      datasets: chart.events.map((event) => ({
        label: name(event),
        data: event.cum,
        borderColor: c[event.venue],
        backgroundColor: c[event.venue],
        borderDash: event.dash ?? [],
        borderWidth: 2.5,
        pointStyle: SHAPE[event.venue],
        pointRadius: 2.5,
        pointHoverRadius: 5,
        tension: 0.25,
      })),
    },
    options,
  }
}

function perTicket(chart, c, animate, narrow) {
  const sorted = [...chart.events].sort((a, b) => b.price - a.price)
  const options = baseOptions(c, animate)
  options.indexAxis = 'y'
  options.plugins.tooltip.callbacks = {
    label: (ctx) => `$${ctx.raw.toFixed(2)} per ticket${sorted[ctx.dataIndex].est ? ' (estimate)' : ''}`,
    afterLabel: (ctx) => `${VENUE[sorted[ctx.dataIndex].venue]} · ${sorted[ctx.dataIndex].pricing} pricing`,
  }
  options.scales = {
    x: axis(c, { ticks: { callback: (v) => `$${v}` }, rest: { beginAtZero: true } }),
    y: axis(c, { rest: { grid: { display: false } } }),
  }
  return {
    type: 'bar',
    data: {
      // The pricing goes on a second line when the chart is phone-narrow.
      labels: sorted.map((event) => {
        const pricing = event.pricing === 'member / general' ? 'member/general' : event.pricing
        const label = `${GLYPH[event.venue]} ${name(event)}`
        return narrow ? [label, pricing] : `${label} · ${pricing}`
      }),
      datasets: [
        {
          data: sorted.map((event) => event.price),
          backgroundColor: sorted.map((event) => (event.est ? alpha(c[event.venue], 0.3) : c[event.venue])),
          borderColor: sorted.map((event) => c[event.venue]),
          borderWidth: sorted.map((event) => (event.est ? 2 : 0)),
          borderRadius: 4,
        },
      ],
    },
    options,
  }
}

function venue(chart, c, animate) {
  const options = baseOptions(c, animate)
  options.plugins.tooltip.callbacks = { label: (ctx) => `${ctx.raw} presales on average` }
  options.scales = {
    x: axis(c, { rest: { grid: { display: false } } }),
    y: axis(c, { title: 'Average presales', rest: { beginAtZero: true } }),
  }
  return {
    type: 'bar',
    data: {
      labels: chart.bars.map((bar) => `${GLYPH[bar.venue]} ${bar.label}`),
      datasets: [
        {
          data: chart.bars.map((bar) => bar.value),
          backgroundColor: chart.bars.map((bar) => c[bar.venue]),
          borderRadius: 4,
          maxBarThickness: 120,
        },
      ],
    },
    options,
  }
}

function days(chart, c, animate) {
  const options = baseOptions(c, animate)
  options.plugins.tooltip.callbacks = {
    title: (items) => chart.bars[items[0].dataIndex].name,
    label: (ctx) => `${ctx.raw} purchases`,
  }
  options.scales = {
    x: axis(c, { rest: { grid: { display: false } } }),
    y: axis(c, { rest: { beginAtZero: true } }),
  }
  return {
    type: 'bar',
    data: {
      labels: chart.bars.map((bar) => bar.label),
      datasets: [
        {
          data: chart.bars.map((bar) => bar.value),
          backgroundColor: chart.bars.map((bar) => (bar.highlight ? c.hi : c.muted)),
          borderRadius: 4,
          maxBarThickness: 64,
        },
      ],
    },
    options,
  }
}

const KINDS = { scatter, cumulative, perTicket, venue, days }

export function drawChart(canvas, chart, { animate }) {
  const c = palette()
  Chart.defaults.font.family = c.font
  Chart.defaults.font.size = 12
  Chart.defaults.color = c.mutedInk
  const narrow = canvas.parentElement.clientWidth < 520
  return new Chart(canvas, KINDS[chart.kind](chart, c, animate, narrow))
}
