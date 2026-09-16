/**
 * One plan-view airliner, shared by every drawing on the site that needs one.
 *
 * Nose at +x, drawn about the origin, roughly 190 units long and 156 across,
 * so a `transform` can place it, size it and turn it: `rotate(180)` faces it
 * the other way down a runway, `rotate(-90)` points it up the page.
 *
 * It lives here rather than in a component because three drawings use it —
 * the week 5 lecture figure and two deck diagrams — and a glyph copied three
 * times is a glyph that ends up three slightly different shapes.
 */
export const AIRLINER_PATHS: readonly string[] = [
  // fuselage
  `M 92 0 C 92 -9, 84 -14, 70 -14 L -72 -14 C -84 -14, -90 -8, -90 0
   C -90 8, -84 14, -72 14 L 70 14 C 84 14, 92 9, 92 0 Z`,
  // wings, swept back
  "M 26 -11 L -34 -78 L -58 -78 L -14 -11 Z",
  "M 26 11 L -34 78 L -58 78 L -14 11 Z",
  // tailplane
  "M -62 -9 L -90 -42 L -102 -42 L -80 -9 Z",
  "M -62 9 L -90 42 L -102 42 L -80 9 Z",
];
