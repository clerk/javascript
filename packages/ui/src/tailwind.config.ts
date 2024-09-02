import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

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
      const addScopedBase = (styles: Record<string, string | Record<string, string>>) => {
        const scopedStyles = Object.entries(styles).reduce(
          (acc, [selectors, properties]) => ({
            ...acc,
            [`:where(${selectors
              .split(',')
              .map(s => s.trim())
              .map(selector => `[class^='cl-'] ${selector}, [class*=' cl-'] ${selector}`)
              .join(', ')})`]: properties,
          }),
          {} as Record<string, string | Record<string, string>>,
        );

        addBase(scopedStyles);
      };

      // https://unpkg.com/tailwindcss@3.4.10/src/css/preflight.css
      addScopedBase({
        '*, ::before, ::after': {
          boxSizing: 'border-box',
          borderWidth: '0',
          borderStyle: 'solid',
          borderColor: theme('borderColor.DEFAULT', 'currentColor'),
        },
        // !IMPORTANT
        // Here we switch `--tw-content` for `--cl-content`
        '::before, ::after': { '--cl-content': "''" },
        'html, :host': {
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
        body: { margin: '0', lineHeight: 'inherit' },
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
    }),
  ],
} satisfies Config;

export default config;
