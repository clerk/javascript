import type { HookDoc } from '../docs-schema';

export default {
  name: 'useMosaicEnvironment',
  description:
    'Returns the active Clerk `EnvironmentResource`, or `undefined` until it hydrates. A one-shot read off the Clerk singleton, not a subscription: it does not re-render when the environment changes.',
  useFor: ['reading static environment config in a model, such as `displayConfig` URLs'],
  keywords: ['environment', 'display config', 'clerk', 'instance settings'],
  practices: [
    { do: true, text: 'Call it from a model only. Models are the one layer that reads Clerk.' },
    { do: true, text: 'Handle `undefined` while the environment hydrates.' },
    {
      do: false,
      text: 'Read a field that can change after hydration, such as `authConfig.claimedAt`. It renders stale; use a reactive subscription instead.',
    },
    { do: false, text: 'Read `clerk.__internal_environment` directly. This hook is its only reader.' },
  ],
  returns: {},
  related: ['useMosaicSupportEmail', 'useMosaicRouter'],
} satisfies HookDoc<undefined, object>;
