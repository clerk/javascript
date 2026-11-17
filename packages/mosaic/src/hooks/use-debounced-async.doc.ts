import type { HookDoc } from '../docs-schema';
import type { DebouncedAsyncOptions, DebouncedAsyncResult } from './use-debounced-async';

export default {
  name: 'useDebouncedAsync',
  description:
    'Runs `run(value, { signal })` once `value` has stopped changing for `delayMs`, and returns the latest result. The previous result stays while the next one is pending. A new value, disabling or unmounting aborts the `signal` and drops any late result.',
  useFor: [
    'a debounced, abortable async check as the user types',
    'a password strength or availability check on an input',
  ],
  keywords: ['debounce', 'async', 'abort', 'signal', 'validation', 'typeahead', 'check'],
  practices: [
    {
      do: true,
      text: 'Pass a primitive or memoized `value`. It is compared with `Object.is`, so an object built during render restarts the debounce every render.',
    },
    { do: true, text: 'Forward `signal` to the request so a superseded check is cancelled.' },
    { do: false, text: 'Debounce with `setTimeout` in a feature. Use this hook instead.' },
  ],
  options: {
    delayMs: { type: 'number', doc: 'Wait this long after the last change before running.' },
    enabled: {
      type: 'boolean',
      doc: 'When `false`, clears the result and cancels any waiting or running check.',
      default: 'true',
    },
  },
  returns: {
    data: { type: 'TData', doc: 'The result of the last settled run for the current or a previous value.' },
    error: { type: 'unknown', doc: 'What the last settled run rejected with.' },
    isError: { type: 'boolean', doc: 'Whether the last settled run rejected.' },
    isPending: {
      type: 'boolean',
      doc: 'Whether no run has settled yet for the current `value`. Always `false` while disabled.',
    },
  },
  examples: [
    {
      title: 'A password strength check',
      code: `
const strength = useDebouncedAsync(password, (value, { signal }) => checkStrength(value, { signal }), {
  delayMs: 300,
  enabled: password !== '',
});
`,
    },
  ],
  related: ['useSpinDelay'],
} satisfies HookDoc<DebouncedAsyncOptions, DebouncedAsyncResult<unknown>>;
