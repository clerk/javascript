import type { HookDoc } from '../docs-schema';
import type { useNow } from './use-now';

export default {
  name: 'useNow',
  description:
    "Returns the current time as a `Date`. Starts from `MosaicProvider`'s mount time when inside one, and only ticks when `updateInterval` is set.",
  useFor: [
    'any current time read during render',
    'a countdown or relative time that ticks',
    'stopping a tick at a deadline with `until`',
  ],
  keywords: ['now', 'time', 'date', 'clock', 'countdown', 'interval', 'tick'],
  practices: [
    { do: true, text: 'Pass `until` for a countdown, so the interval stops once the deadline passes.' },
    { do: false, text: 'Call `new Date()` or `Date.now()` during render. Use this hook instead.' },
  ],
  options: {
    updateInterval: { type: 'number', doc: 'Milliseconds between ticks. No ticking when unset.' },
    until: { type: 'number', doc: 'A timestamp in milliseconds. Ticking stops once `now` reaches it.' },
  },
  returns: {},
  examples: [
    {
      title: 'Tick every second until a deadline',
      code: `
const now = useNow({ updateInterval: 1000, until: expiresAt });
`,
    },
  ],
  related: ['useResendSeconds'],
} satisfies HookDoc<NonNullable<Parameters<typeof useNow>[0]>, ReturnType<typeof useNow>>;
