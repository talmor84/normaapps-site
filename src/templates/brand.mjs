// The Norma wordmark lockup.
//
// Copied from the canonical brand source (TAL_App marketing/src/brand/lockup.mjs,
// lockupInnerSvg). The geometry, the triangle points and the NORMA text settings
// are byte-identical. Do not redraw or adjust them.
//
// Colors: the documented light-ground variant of the lockup
// (forest tile #0f3d3d, cream triangle #f4f1ec, forest NORMA text).

export const LOCKUP_VIEWBOX = '0 0 182 56';
export const TRIANGLE_POINTS_32U = '10,5 10,27 24,27';

const TEXT_FONT_STACK =
  "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

export function lockupInnerSvg({
  tileFill = '#0f3d3d',
  triangleStroke = '#f4f1ec',
  textFill = '#0f3d3d',
} = {}) {
  return [
    `<rect x="4" y="5" width="46" height="46" rx="9" ry="9" fill="${tileFill}"/>`,
    `<svg x="10" y="11" width="34" height="34" viewBox="0 0 32 32">`,
    `<polygon points="${TRIANGLE_POINTS_32U}" fill="none" stroke="${triangleStroke}" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"/>`,
    `</svg>`,
    `<text x="66" y="37" font-family="${TEXT_FONT_STACK}" font-weight="500" font-size="26" letter-spacing="2.6" fill="${textFill}">NORMA</text>`,
  ].join('\n  ');
}

export function lockup({ height = 34, label = 'Norma' } = {}) {
  const width = Math.round((height * 182) / 56);
  return `<svg class="lockup" role="img" aria-label="${label}" width="${width}" height="${height}" viewBox="${LOCKUP_VIEWBOX}" xmlns="http://www.w3.org/2000/svg">
  ${lockupInnerSvg()}
</svg>`;
}
