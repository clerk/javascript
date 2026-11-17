import type { ComponentDoc } from '../../docs-schema';
import type { CaptchaProps } from './captcha';

export default {
  name: 'Captcha',
  description:
    'The element clerk-js renders Cloudflare Turnstile into when a sign-in or sign-up needs a CAPTCHA. Stays empty and out of the layout until Turnstile asks for an interactive challenge, when clerk-js sets `data-cl-interactive` on it.',
  useFor: ['a CAPTCHA on a sign-in or sign-up screen', 'the Turnstile bot-protection widget'],
  keywords: ['captcha', 'turnstile', 'bot protection', 'cloudflare', 'challenge'],
  practices: [
    { do: true, text: 'Render one per page, mounted before the sign-in or sign-up is created.' },
    { do: true, text: 'Pass `onInteractiveChange` to make room when the challenge appears.' },
    { do: false, text: 'Pass `id`. The element must carry the id clerk-js looks for, so the component owns it.' },
  ],
  parts: {
    Captcha: {
      description: 'Renders an empty `div`, or the `render` element, with the options as `data-cl-*` attributes.',
      slot: 'cl-captcha',
      props: {
        theme: {
          type: "'auto' | 'light' | 'dark'",
          doc: 'Turnstile theme.',
          default: "from the element's `color-scheme`: `dark`, `light`, or `auto` when both are allowed",
        },
        size: {
          type: "'normal' | 'flexible' | 'compact'",
          doc: 'Turnstile size: `normal`, `flexible` or `compact`.',
          default: "Turnstile's `normal`",
        },
        language: { type: 'string', doc: 'ISO 639-1 code such as `en-us`.', default: "the visitor's language" },
        onInteractiveChange: {
          type: '(interactive: boolean) => void',
          doc: 'Called when Turnstile starts or stops asking for an interactive challenge.',
        },
      },
    },
  },
  examples: [
    {
      title: 'Dark',
      code: `
<Captcha theme='dark' />
`,
    },
  ],
} satisfies ComponentDoc<{ Captcha: CaptchaProps }>;
