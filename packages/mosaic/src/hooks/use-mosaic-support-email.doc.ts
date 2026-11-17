import type { HookDoc } from '../docs-schema';

export default {
  name: 'useMosaicSupportEmail',
  description:
    'Returns the support email for "contact us" copy: the `supportEmail` Clerk option, then `displayConfig.supportEmail`, then `support@` plus the Frontend API host. `undefined` until the value is stable. A one-shot read, not a subscription.',
  useFor: ['a support email address in help or error copy'],
  keywords: ['support', 'email', 'contact', 'help'],
  practices: [
    { do: true, text: 'Handle `undefined` while the environment hydrates.' },
    { do: false, text: 'Build `support@` from the Frontend API yourself. It would skip a configured address.' },
  ],
  returns: {},
  related: ['useMosaicEnvironment'],
} satisfies HookDoc<undefined, object>;
