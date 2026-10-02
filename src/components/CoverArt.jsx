import { useEffect, useRef } from "react";
import { watchInView } from "../lib/coverMotion";
import "./CoverArt.css";

/* Minimal animated covers for the Singles: one small vector scene each,
   drawn on a 100×100 grid over the cover's palette gradient, so they're
   crisp at any size. All motion is CSS keyframes on transform and
   opacity (CoverArt.css); this component only reports whether it's on
   screen. `mode`: 'hover' on a card (plays while the card is hovered or
   focused, or simply while on screen on touch screens), 'view' in a case
   study's header (plays while on screen). Every scene's resting frame
   is a complete picture, for reduced motion and while paused. */

function Aspiration() {
  return (
    <>
      {/* Aspiration's logo: an outlined sprout on a green disc (still) */}
      <circle cx="50" cy="53" r="35" className="ca-asp-disc" />
      <path d="M38 73.5 H63" className="ca-asp-stroke" />
      <path
        d="M51.5 73 C51.5 66 49 61 51.5 54 C52.5 51.5 53 51 53 50"
        className="ca-asp-stroke"
      />
      <path
        d="M51.5 54 C45 45 37 42 31 43.5 C33.5 50.5 41 56 51.5 54 Z"
        className="ca-asp-stroke"
      />
      <path
        d="M53 50 C54 41 60 35.5 69 33.5 C68.5 42.5 62 48.5 53 50 Z"
        className="ca-asp-stroke"
      />
    </>
  );
}

function Gizmo() {
  const gills = [
    { d: "M22 40 C14 35 9 30 8 24", side: "l" },
    { d: "M20 48 C11 47 6 44 3 39", side: "l" },
    { d: "M21 56 C13 58 8 57 4 54", side: "l" },
    { d: "M78 40 C86 35 91 30 92 24", side: "r" },
    { d: "M80 48 C89 47 94 44 97 39", side: "r" },
    { d: "M79 56 C87 58 92 57 96 54", side: "r" },
  ];
  return (
    // Drawn full size, then scaled down about the bottom edge so it sits
    // on the bottom of the cover.
    <g transform="translate(50 100) scale(0.72) translate(-50 -100)">
      <g className="ca-anim ca-giz-float">
        {/* A minimal axolotl: gills, a round head, a body with two arms */}
        <g className="ca-anim ca-giz-gills-l">
          {gills
            .filter((g) => g.side === "l")
            .map((g) => (
              <path key={g.d} d={g.d} className="ca-giz-gill" />
            ))}
        </g>
        <g className="ca-anim ca-giz-gills-r">
          {gills
            .filter((g) => g.side === "r")
            .map((g) => (
              <path key={g.d} d={g.d} className="ca-giz-gill" />
            ))}
        </g>
        <path d="M35 71 C27 75 22.5 82 21.5 91" className="ca-giz-arm" />
        <path d="M65 71 C73 75 77.5 82 78.5 91" className="ca-giz-arm" />
        <rect
          x="31"
          y="66"
          width="38"
          height="40"
          rx="16"
          className="ca-giz-body"
        />
        <ellipse cx="50" cy="48" rx="31" ry="25" className="ca-giz-head" />
        <ellipse cx="33" cy="58" rx="4.5" ry="2.6" className="ca-giz-cheek" />
        <ellipse cx="67" cy="58" rx="4.5" ry="2.6" className="ca-giz-cheek" />
        <g className="ca-anim ca-giz-eyes">
          <circle cx="38" cy="49" r="4.6" className="ca-giz-eye" />
          <circle cx="62" cy="49" r="4.6" className="ca-giz-eye" />
          <circle cx="39.6" cy="47.4" r="1.5" className="ca-giz-shine" />
          <circle cx="63.6" cy="47.4" r="1.5" className="ca-giz-shine" />
        </g>
        <path
          d="M42 59.5 C44.5 62 47 62 50 59.5 C53 62 55.5 62 58 59.5"
          className="ca-giz-smile"
        />
      </g>
    </g>
  );
}

function Record() {
  return (
    <>
      <circle cx="50" cy="52" r="37" className="ca-shadow" />
      <g className="ca-anim ca-rec-spin">
        <circle cx="50" cy="50" r="36" className="ca-vinyl" />
        {[33, 30, 27, 24, 21, 18].map((r) => (
          <circle key={r} cx="50" cy="50" r={r} className="ca-groove" />
        ))}
        <circle cx="50" cy="50" r="12" className="ca-label" />
      </g>
      <circle cx="50" cy="50" r="1.6" className="ca-hole" />
      {/* The sheen stays put while the record turns under it */}
      <path d="M50 14 A36 36 0 0 1 81 32 L50 50 Z" className="ca-sheen" />
    </>
  );
}

function Pricing() {
  const people = [22, 33.2, 44.4, 55.6, 66.8, 78];
  // Heights in proportion to price, the tallest kept clear of the crowd line.
  const bars = [
    { x: 21, top: 62, price: "$12" },
    { x: 42, top: 56, price: "$15" },
    { x: 63, top: 46, price: "$20" },
  ];
  return (
    <>
      {/* The crowd: the same six people at every price */}
      {people.map((x) => (
        <g key={x} className="ca-fill">
          <circle cx={x} cy="17" r="3" />
          <path
            d={`M${x - 4.2} 28 C${x - 4.2} 22.5 ${x + 4.2} 22.5 ${x + 4.2} 28 Z`}
          />
        </g>
      ))}
      <line x1="14" y1="32" x2="86" y2="32" className="ca-level" />
      {/* The price ladder, stepping up */}
      {bars.map(({ x, top, price }, i) => (
        <g key={price}>
          <rect
            x={x}
            y={top}
            width="16"
            height={86 - top}
            rx="2"
            className={`ca-anim ca-bar ca-bar-${i + 1}`}
          />
          <text
            x={x + 8}
            y={top - 3.5}
            className={`ca-anim ca-price ca-price-${i + 1}`}
          >
            {price}
          </text>
        </g>
      ))}
      <line x1="14" y1="86.5" x2="86" y2="86.5" className="ca-line" />
    </>
  );
}

const SCENES = {
  aspiration: Aspiration,
  gizmo: Gizmo,
  record: Record,
  pricing: Pricing,
};

export default function CoverArt({ kind, mode = "view" }) {
  const ref = useRef(null);
  useEffect(() => watchInView(ref.current), []);
  const Scene = SCENES[kind];
  return (
    <svg
      ref={ref}
      className="cover-art"
      data-kind={kind}
      data-mode={mode}
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      {Scene ? <Scene /> : null}
    </svg>
  );
}
