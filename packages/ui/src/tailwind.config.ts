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
    plugin(function ({ addBase, addVariant, theme }) {
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
        ':root': {
          '--cl-light': 'initial',
          '--cl-dark': ' ',
          colorScheme: 'light dark',
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
          // Values generated via the "Theme Builder" (Dark omitted until later)
          '--color-background': '#fff',
          '--cl-accent-1': '#fdfdfe',
          '--cl-accent-2': '#f8f9fd',
          '--cl-accent-3': '#eef0f8',
          '--cl-accent-4': '#e4e6f3',
          '--cl-accent-5': '#dadcea',
          '--cl-accent-6': '#cfd1de',
          '--cl-accent-7': '#bfc1ce',
          '--cl-accent-8': '#a8aab7',
          '--cl-accent-9': '#2f3037',
          '--cl-accent-10': '#42434a',
          '--cl-accent-11': '#656773',
          '--cl-accent-12': '#34353c',
          '--cl-accent-a1': '#00008002',
          '--cl-accent-a2': '#0025b707',
          '--cl-accent-a3': '#001e9611',
          '--cl-accent-a4': '#00138e1b',
          '--cl-accent-a5': '#000e6f25',
          '--cl-accent-a6': '#000b5030',
          '--cl-accent-a7': '#00083c40',
          '--cl-accent-a8': '#00062c57',
          '--cl-accent-a9': '#00010ad0',
          '--cl-accent-a10': '#00020bbd',
          '--cl-accent-a11': '#0004189a',
          '--cl-accent-a12': '#00010acb',
          '--cl-accent-contrast': '#fff',
          '--cl-accent-surface': '#f6f8fdcc',
          '--cl-accent-indicator': '#2f3037',
          '--cl-accent-track': '#2f3037',
          '--cl-gray-1': '#fcfcfd',
          '--cl-gray-2': '#f9f9fc',
          '--cl-gray-3': '#eff0f4',
          '--cl-gray-4': '#e7e8ed',
          '--cl-gray-5': '#dfe0e7',
          '--cl-gray-6': '#d8d9e1',
          '--cl-gray-7': '#cdced8',
          '--cl-gray-8': '#b9bbc8',
          '--cl-gray-9': '#8b8d99',
          '--cl-gray-10': '#81828e',
          '--cl-gray-11': '#62646d',
          '--cl-gray-12': '#1f2026',
          '--cl-gray-a1': '#00005503',
          '--cl-gray-a2': '#00008006',
          '--cl-gray-a3': '#00105010',
          '--cl-gray-a4': '#000b4018',
          '--cl-gray-a5': '#00084020',
          '--cl-gray-a6': '#00073b27',
          '--cl-gray-a7': '#00063932',
          '--cl-gray-a8': '#00083746',
          '--cl-gray-a9': '#00051f74',
          '--cl-gray-a10': '#00031b7e',
          '--cl-gray-a11': '#0004129d',
          '--cl-gray-a12': '#000108e0',
          '--cl-gray-contrast': '#fff',
          '--cl-gray-surface': '#ffffffcc',
          '--cl-gray-indicator': '#8b8d99',
          '--cl-gray-track': '#8b8d99',
        },
        '@supports (color: color(display-p3 1 1 1))': {
          '@media (color-gamut: p3)': {
            ':where(:root)': {
              '--cl-accent-1': 'oklch(99.4% 0.0012 279.2)',
              '--cl-accent-2': 'oklch(98.3% 0.005 279.2)',
              '--cl-accent-3': 'oklch(95.5% 0.0112 279.2)',
              '--cl-accent-4': 'oklch(92.8% 0.0174 279.2)',
              '--cl-accent-5': 'oklch(89.8% 0.0188 279.2)',
              '--cl-accent-6': 'oklch(86.2% 0.0188 279.2)',
              '--cl-accent-7': 'oklch(81.2% 0.0188 279.2)',
              '--cl-accent-8': 'oklch(74.1% 0.0188 279.2)',
              '--cl-accent-9': 'oklch(31.1% 0.0125 279.2)',
              '--cl-accent-10': 'oklch(38.4% 0.0125 279.2)',
              '--cl-accent-11': 'oklch(51.5% 0.0188 279.2)',
              '--cl-accent-12': 'oklch(33% 0.0125 279.2)',
              '--cl-accent-a1': 'color(display-p3 0.0196 0.0196 0.5098 / 0.008)',
              '--cl-accent-a2': 'color(display-p3 0.0235 0.1608 0.7216 / 0.028)',
              '--cl-accent-a3': 'color(display-p3 0.0078 0.1255 0.5333 / 0.067)',
              '--cl-accent-a4': 'color(display-p3 0.0039 0.0784 0.5216 / 0.106)',
              '--cl-accent-a5': 'color(display-p3 0.0078 0.0627 0.4118 / 0.146)',
              '--cl-accent-a6': 'color(display-p3 0.0078 0.0471 0.298 / 0.189)',
              '--cl-accent-a7': 'color(display-p3 0.0039 0.0314 0.2196 / 0.251)',
              '--cl-accent-a8': 'color(display-p3 0.0039 0.0275 0.1647 / 0.342)',
              '--cl-accent-a9': 'color(display-p3 0 0.0039 0.0353 / 0.816)',
              '--cl-accent-a10': 'color(display-p3 0 0.0078 0.0392 / 0.742)',
              '--cl-accent-a11': 'color(display-p3 0 0.0157 0.0863 / 0.604)',
              '--cl-accent-a12': 'color(display-p3 0 0.0039 0.0353 / 0.797)',
              '--cl-accent-contrast': '#fff',
              '--cl-accent-surface': 'color(display-p3 0.9725 0.9725 0.9843 / 0.8)',
              '--cl-accent-indicator': 'oklch(31.1% 0.0125 279.2)',
              '--cl-accent-track': 'oklch(31.1% 0.0125 279.2)',
              '--cl-gray-1': 'oklch(99.2% 0.0017 279.2)',
              '--cl-gray-2': 'oklch(98.3% 0.0031 279.2)',
              '--cl-gray-3': 'oklch(95.6% 0.0055 279.2)',
              '--cl-gray-4': 'oklch(93.2% 0.0073 279.2)',
              '--cl-gray-5': 'oklch(90.9% 0.0094 279.2)',
              '--cl-gray-6': 'oklch(88.6% 0.0108 279.2)',
              '--cl-gray-7': 'oklch(85.4% 0.0134 279.2)',
              '--cl-gray-8': 'oklch(79.4% 0.0181 279.2)',
              '--cl-gray-9': 'oklch(64.6% 0.0182 279.2)',
              '--cl-gray-10': 'oklch(61.1% 0.0173 279.2)',
              '--cl-gray-11': 'oklch(50.5% 0.015 279.2)',
              '--cl-gray-12': 'oklch(24.5% 0.0125 279.2)',
              '--cl-gray-a1': 'color(display-p3 0.0235 0.0235 0.349 / 0.012)',
              '--cl-gray-a2': 'color(display-p3 0.0235 0.0235 0.5137 / 0.024)',
              '--cl-gray-a3': 'color(display-p3 0.0078 0.0667 0.3176 / 0.063)',
              '--cl-gray-a4': 'color(display-p3 0.0118 0.051 0.2588 / 0.095)',
              '--cl-gray-a5': 'color(display-p3 0.0078 0.0353 0.2235 / 0.126)',
              '--cl-gray-a6': 'color(display-p3 0.0039 0.0275 0.2078 / 0.153)',
              '--cl-gray-a7': 'color(display-p3 0.0078 0.0275 0.2039 / 0.197)',
              '--cl-gray-a8': 'color(display-p3 0.0039 0.0314 0.2039 / 0.275)',
              '--cl-gray-a9': 'color(display-p3 0.0039 0.0196 0.1137 / 0.455)',
              '--cl-gray-a10': 'color(display-p3 0.0039 0.0118 0.098 / 0.495)',
              '--cl-gray-a11': 'color(display-p3 0 0.0157 0.0667 / 0.616)',
              '--cl-gray-a12': 'color(display-p3 0 0.0039 0.0275 / 0.879)',
              '--cl-gray-contrast': '#fff',
              '--cl-gray-surface': 'color(display-p3 1 1 1 / 80%)',
              '--cl-gray-indicator': 'oklch(64.6% 0.0182 279.2)',
              '--cl-gray-track': 'oklch(64.6% 0.0182 279.2)',
            },
          },
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

      /**
       * Conditionally apply CSS to ios devices
       */
      addVariant('supports-ios', '@supports (-webkit-touch-callout: none)');
    }),
  ],
} satisfies Config;

export default config;
