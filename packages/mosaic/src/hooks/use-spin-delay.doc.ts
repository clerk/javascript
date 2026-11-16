import type { HookDoc } from '../docs-schema';
import type { SpinDelayOptions } from './use-spin-delay';

export default {
  name: 'useSpinDelay',
  description:
    'Spin-delays a nullable value. Returns `null` until `value` stays non-null and unchanged longer than `delay`; a new value restarts the wait. Once shown, it keeps a value up until at least `minDuration` after it first appeared. Swapping to another non-null value does not restart `minDuration`. Call it as `useSpinDelay(value, options?)`.',
  useFor: ['a spinner that should not flash or flicker', 'a pending indicator that stays up long enough to read'],
  keywords: ['spinner', 'loading', 'delay', 'flash', 'flicker', 'pending'],
  practices: [
    { do: false, text: 'Delay a spinner with `setTimeout`. Use this hook instead.' },
    { do: false, text: 'Reach for it inside a button. `SubmitButton` already spin-delays its spinner.' },
  ],
  options: {
    delay: {
      type: 'number',
      doc: 'Wait this long before showing the value. `0` shows it straight away.',
      default: '150',
    },
    minDuration: {
      type: 'number',
      doc: 'Once shown, keep a value up at least this long, counted from when the first value appeared, not from a later swap.',
      default: '400',
    },
  },
  returns: {},
  examples: [
    {
      title: 'Delay a pending flag',
      code: `
const showSpinner = useSpinDelay(isPending ? true : null) !== null;
`,
    },
  ],
  related: ['SubmitButton', 'Spinner'],
} satisfies HookDoc<SpinDelayOptions, object>;
