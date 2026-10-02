/* One IntersectionObserver for every animated cover: it only marks each
   one data-inview="true" | "false". CSS does the rest (CoverArt.css):
   the covers' keyframes run while in view (and, on a card, while it's
   hovered or focused), and hold during the idle pause, so there's no
   per-cover loop or timer at all. */

let observer = null

export function watchInView(el) {
  observer ??= new IntersectionObserver((entries) => {
    for (const entry of entries) entry.target.dataset.inview = entry.isIntersecting ? 'true' : 'false'
  })
  observer.observe(el)
  return () => observer.unobserve(el)
}
