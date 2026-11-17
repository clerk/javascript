import type { HookDoc } from '../docs-schema';

export default {
  name: 'useResendSeconds',
  description:
    'Returns the whole seconds left until `resendAvailableAt`, ticking every second, clamped between `0` and `maxSeconds`. Call it as `useResendSeconds(resendAvailableAt, maxSeconds)`. Returns `0` when `resendAvailableAt` is `undefined`.',
  useFor: ['the seconds left on a resend cooldown, for display', 'a "Resend code in 30s" label'],
  keywords: ['resend', 'cooldown', 'countdown', 'seconds', 'verification code', 'otp'],
  practices: [
    { do: true, text: 'Keep `resendAvailableAt` in the machine, and derive the seconds in the view with this hook.' },
    { do: false, text: 'Count seconds down in state or a machine. Store the timestamp instead.' },
  ],
  returns: {},
  examples: [
    {
      title: 'A resend label',
      code: `
const seconds = useResendSeconds(resendAvailableAt, 30);
`,
    },
  ],
  related: ['useNow'],
} satisfies HookDoc<undefined, object>;
