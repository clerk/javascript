import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

// fix hr

function generateColorScale(name: string) {
  const scale = Array.from({ length: 12 }, (_, i) => {
    const id = i + 1;
    return [
      [id, `var(--cl-${name}-${id})`],
      [`a${id}`, `var(--cl-${name}-a${id})`],
    ];
  }).flat();

  return Object.fromEntries(scale);
}

const SPACE = [
  [1, '0.25'],
  [1.5, '0.375'],
  [2, '0.5'],
  [3, '0.75'],
  [4, '1'],
  [5, '1.25'],
  [6, '1.5'],
  [7, '1.75'],
  [8, '2'],
] as const;

function generateSpaceScale() {
  return Object.fromEntries(
    SPACE.map(([id, value]) => {
      return [`space-${id}`, `calc(${value} * var(--cl-spacing-unit, 1rem))`];
    }),
  );
}

const config = {
  corePlugins: {
    preflight: false,
    backgroundOpacity: false,
  },
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  future: {
    respectDefaultRingColorOpacity: true,
  },
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--cl-font-family)'],
      },
      fontSize: {
        DEFAULT: ['var(--cl-font-size)', '1.38462'],
        base: ['var(--cl-font-size)', '1.38462'],
        xs: ['calc(var(--cl-font-size) * 0.8)', '1.38462'],
        sm: ['calc(var(--cl-font-size) * 0.9)', '1.38462'],
        md: ['var(--cl-font-size)', '1.38462'],
        lg: ['calc(var(--cl-font-size) * 1.3)', '1.38462'],
        xl: ['calc(var(--cl-font-size) * 1.85)', '1.38462'],
        'icon-sm': ['calc(var(--cl-font-size) * 1.23)', '0'],
      },
      borderRadius: {
        DEFAULT: 'var(--cl-radius)',
        sm: 'calc(var(--cl-radius) * 0.66)',
        md: 'var(--cl-radius)',
        lg: 'calc(var(--cl-radius) * 1.33)',
        xl: 'calc(var(--cl-radius) * 2)',
      },
      lineHeight: {
        normal: 'normal',
        extraSmall: '1.33333',
        small: '1.38462',
        medium: '1.41176',
        large: '1.45455',
      },
      spacing: {
        ...generateSpaceScale(),
      },
      zIndex: {
        1: '1',
      },
      colors: {
        accent: {
          ...generateColorScale('accent'),
          contrast: 'var(--cl-accent-contrast)',
          surface: 'var(--cl-accent-surface)',
        },
        gray: {
          ...generateColorScale('gray'),
          contrast: 'var(--cl-gray-contrast)',
          surface: 'var(--cl-gray-surface)',
        },
        danger: {
          DEFAULT: 'hsl(var(--cl-color-danger))',
        },
        success: {
          DEFAULT: 'hsl(var(--cl-color-success))',
        },
        warning: {
          DEFAULT: 'hsl(var(--cl-color-warning))',
        },
      },
      ringWidth: {
        DEFAULT: '0.1875rem',
      },
      ringColor: {
        DEFAULT: 'var(--cl-gray-a7)',
        light: 'var(--cl-gray-a4)',
        'light-opaque': 'var(--cl-gray-4)',
      },
      animation: {
        spin: 'cl-spin linear infinite',
        blink: 'cl-blink 1s step-end 0.2s infinite',
      },
    },
  },
  plugins: [
    plugin(function ({ addBase, theme }) {
      /**
       * Extends Tailwind's built-in `addBase` function by scoping styles to
       * only affect components within the `@clerk/ui` package.
       *
       * Currently, we do this by only applying to elements with a class that
       * begins with `cl-` (set by the `tailwindcss-transformer`), however, we
       * may want to explore something more rigid (e.g. data attributes) in the
       * future.
       *
       * Selectors are wrapped in a `:where()` pseudo-selector to keep
       * specificity to 0,0,0.
       */
      const addScopedBase = (styles: Record<string, string | Record<string, string>>) => {
        const scopedStyles = Object.entries(styles).reduce(
          (acc, [selectors, properties]) => ({
            ...acc,
            [`:where(${selectors
              // Splits selectors by the comma, unless that comma is in brackets
              // e.g. a pseudo selector like :not(svg,use)
              .match(/(?:[^,()]|\((?:[^()]|\([^()]*\))*\))+(?=\s*(?:,|$))/g)
              ?.map(item => item.trim())
              .filter(item => item !== '')
              .map(selector => {
                return [
                  `${selector}[class^='cl-']`, // direct; class starts with ` cl-`
                  `[class^='cl-'] ${selector}`, //  child; class starts with ` cl-`
                  `${selector}[class*=' cl-']`, // direct class contains ` cl-`
                  `[class*=' cl-'] ${selector}`, // child; class contains ` cl-`
                ].join(', ');
              })
              .join(', ')})`]: properties,
          }),
          {} as Record<string, string | Record<string, string>>,
        );

        addBase(scopedStyles);
      };

      /* Global Styles
        ============================================ */

      /**
       * Keyframes (unscoped)
       */
      addBase({
        '@keyframes cl-spin': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        '@keyframes cl-blink': {
          'from, to': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      });

      /**
       * 1. Revert all styles to User Agent defaults (scoped)
       *
       *    We intentionally avoid targeting SVGs (and their children) due to
       *    unwanted side-effects
       *
       *    See https://cloudfour.com/thinks/resetting-inherited-css-with-revert
       */
      addScopedBase({
        '*:not(svg, svg *), use': {
          all: 'revert',
        },
      });

      /**
       * 2. Apply Tailwind's `preflight.css` (scoped)
       *
       *    See https://tailwindcss.com/docs/preflight
       *
       *    i. In the official `preflight.css`, the next ruleset would be:
       *
       *       ```css
       *       ::before, ::after {
       *         --tw-content: '';
       *       }
       *       ```
       *
       *       However, in `tailwindcss-transformer`, our variables are prefixed
       *       with `cl` to prevent collision with consumers using Tailwind.
       *
       *       Additionally, all of our variables are **not scoped**. For this
       *       reset to work effectively, we'll need to move it to `addBase`
       *       later.
       *
       *    ii. `html`, `:host` and `body` won't be used within our UI
       *        components. Instead we'll swap `html, :host` for a `*` selector,
       *        and ditch the `body` styles completely.
       */
      addScopedBase({
        '*, ::before, ::after': {
          boxSizing: 'border-box',
          borderWidth: '0',
          borderStyle: 'solid',
          borderColor: theme('borderColor.DEFAULT', 'currentColor'),
        },
        /* [i] */
        /* [ii] */
        '*': {
          lineHeight: '1.5',
          WebkitTextSizeAdjust: '100%',
          MozTabSize: '4',
          tabSize: '4',
          fontFamily: theme(
            'fontFamily.sans',
            'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
          ),
          fontFeatureSettings: theme('fontFamily.sans[1].fontFeatureSettings', 'normal'),
          fontVariationSettings: theme('fontFamily.sans[1].fontVariationSettings', 'normal'),
          WebkitTapHighlightColor: 'transparent',
        },
        hr: { height: '0', color: 'inherit', borderTopWidth: '1px' },
        'abbr[title]': { textDecoration: 'underline dotted' },
        'h1, h2, h3, h4, h5, h6': { fontSize: 'inherit', fontWeight: 'inherit' },
        a: { color: 'inherit', textDecoration: 'inherit' },
        'b, strong': { fontWeight: 'bolder' },
        'code, kbd, samp, pre': {
          fontFamily: theme(
            'fontFamily.mono',
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          ),
          fontFeatureSettings: theme('fontFamily.mono[1].fontFeatureSettings', 'normal'),
          fontVariationSettings: theme('fontFamily.mono[1].fontVariationSettings', 'normal'),
          fontSize: '1em',
        },
        small: { fontSize: '80%' },
        'sub, sup': {
          fontSize: '75%',
          lineHeight: '0',
          position: 'relative',
          verticalAlign: 'baseline',
        },
        sub: { bottom: '-0.25em' },
        sup: { top: '-0.5em' },
        table: {
          textIndent: '0',
          borderColor: 'inherit',
          borderCollapse: 'collapse',
        },
        'button, input, optgroup, select, textarea': {
          fontFamily: 'inherit',
          fontFeatureSettings: 'inherit',
          fontVariationSettings: 'inherit',
          fontSize: '100%',
          fontWeight: 'inherit',
          lineHeight: 'inherit',
          letterSpacing: 'inherit',
          color: 'inherit',
          margin: '0',
          padding: '0',
        },
        'button, select': { textTransform: 'none' },
        "button, input:where([type='button']), input:where([type='reset']), input:where([type='submit'])": {
          WebkitAppearance: 'button',
          backgroundColor: 'transparent',
          backgroundImage: 'none',
        },
        ':-moz-focusring': { outline: 'auto' },
        ':-moz-ui-invalid': { boxShadow: 'none' },
        progress: { verticalAlign: 'baseline' },
        '::-webkit-inner-spin-button, ::-webkit-outer-spin-button': {
          height: 'auto',
        },
        "[type='search']": { WebkitAppearance: 'textfield', outlineOffset: '-2px' },
        '::-webkit-search-decoration': { WebkitAppearance: 'none' },
        '::-webkit-file-upload-button': {
          WebkitAppearance: 'button',
          font: 'inherit',
        },
        summary: { display: 'list-item' },
        'blockquote, dl, dd, h1, h2, h3, h4, h5, h6, hr, figure, p, pre': {
          margin: '0',
        },
        fieldset: { margin: '0', padding: '0' },
        legend: { padding: '0' },
        'ol, ul, menu': { listStyle: 'none', margin: '0', padding: '0' },
        dialog: { padding: '0' },
        textarea: { resize: 'vertical' },
        'input::placeholder, textarea::placeholder': {
          opacity: '1',
          color: theme('colors.gray.400', '#9ca3af'),
        },
        'button, [role="button"]': { cursor: 'pointer' },
        ':disabled': { cursor: 'default' },
        'img, svg, video, canvas, audio, iframe, embed, object': {
          display: 'block',
          verticalAlign: 'middle',
        },
        'img, video': { maxWidth: '100%', height: 'auto' },
        '[hidden]': { display: 'none' },
      });

      /**
       * 3. Apply default theme variables (unscoped)
       */
      addBase({
        ':where(:root)': {
          '--cl-font-family':
            '-apple-system, BlinkMacSystemFont, avenir next, avenir, segoe ui, helvetica neue, helvetica,\n    Cantarell, Ubuntu, roboto, noto, arial, sans-serif',
          '--cl-color-danger': '0 84% 60%',
          '--cl-color-success': '142 71% 45%',
          '--cl-color-warning': '25 95% 53%',
          '--cl-radius': '0.375rem',
          '--cl-spacing-unit': '1rem',
          '--cl-font-size': '0.8125rem',
        },
      });

      /**
       * 4. Apply aforementioned `preflight.css` pseudo resets (unscoped)
       */
      addBase({
        '::before, ::after': {
          '--cl-content': "''",
        },
      });

      /**
       * 5. Set page-level styling (scoped)
       *
       *    Ordinarily we'd opt for applying these styles to the `html` or
       *    `body` elements, but in our case, we have no "root" element to
       *    target. Instead, we apply these defaults to **all** of our elements.
       */
      addScopedBase({
        '*': {
          fontFamily: 'var(--cl-font-family)',
        },
      });
    }),
  ],
} satisfies Config;

export default config;
