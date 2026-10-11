// Colour pairs for scripts/check-contrast.mjs (npm run check:contrast).
// WCAG 2.1: text needs 4.5:1 (1.4.3), UI components and meaningful graphics 3:1 (1.4.11).
// Colours can be custom properties from :root of the stylesheet (var(--name)) or literal hex colours.

export const TEXT = 4.5
export const UI = 3

export const stylesheet = 'src/css/style.css'

/**
 * [foreground, background, minimum ratio, description, options]
 * options.external: a literal colour that does not come from the stylesheet (a framework, a module)
 * options.informational: report the ratio, but do not fail on it (decorative colours)
 *
 * The colours are the literal colours of the original iTheme. The pairs that do not reach the minimum are
 * informational: the migration keeps the design as it was, see "Contrast" in MIGRATION.md.
 */
export const pairs = [
    ['#000000', '#ffffff', TEXT, 'body text'],
    ['#666666', '#ffffff', TEXT, 'links'],
    ['#8e8e8e', '#ffffff', TEXT, 'links on hover', { informational: true }],
    ['#666666', '#8bbcdd', TEXT, 'links in the header menu', { informational: true }],
    ['#ffffff', '#8bbcdd', TEXT, 'links in the header menu on hover', { informational: true }],
    ['#666666', '#59b9e4', TEXT, 'footer text', { informational: true }],
    ['#333333', '#59b9e4', TEXT, 'links in the footer'],
    ['#ffffff', '#59b9e4', TEXT, 'links in the footer on hover', { informational: true }],
]
