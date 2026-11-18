import type { HookDoc } from '../docs-schema';
import type { MosaicRouter } from './use-mosaic-router';

export default {
  name: 'useMosaicRouter',
  description:
    "Mosaic's navigation seam. Routes through `clerk.navigate`, hard-redirects through Clerk's window navigator, and reads the current search params.",
  useFor: ['navigating after a flow finishes', 'a hard redirect to another page', 'reading query params in a model'],
  keywords: ['router', 'navigate', 'redirect', 'search params', 'query string', 'url'],
  practices: [
    { do: true, text: 'Call it from a model, and pass plain callbacks down.' },
    { do: false, text: 'Call `clerk.navigate` or `window.location` directly. Go through this hook.' },
  ],
  returns: {
    navigate: {
      type: '(to: string) => void | Promise<unknown>',
      doc: "Navigates with the host's router through `clerk.navigate`.",
    },
    windowNavigate: {
      type: '(to: URL | string) => void',
      doc: 'Hard-navigates the window. Uses `clerk.__internal_windowNavigate` when the Clerk runtime has it.',
    },
    getSearchParams: { type: '() => URLSearchParams', doc: 'Reads `window.location.search`. Empty on the server.' },
  },
  related: ['useMosaicEnvironment'],
} satisfies HookDoc<undefined, MosaicRouter>;
