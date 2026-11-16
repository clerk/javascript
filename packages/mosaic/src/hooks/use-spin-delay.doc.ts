import type { HookDoc } from '../docs-schema';
import type { SpinDelayOptions } from './use-spin-delay';

export default {
  name: 'useSpinDelay',
  description:
    'Spin-delays a nullable value. Returns `null` until `value` stays non-null longer than `delay`, then holds the last non-null value at least `minDuration` after it clears. Call it as `useSpinDelay(value, options?)`.',
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
    minDuration: { type: 'number', doc: 'Once shown, keep the value up at least this long.', default: '400' },
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
