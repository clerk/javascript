import type { ComponentDoc } from '../../docs-schema';
import type { ProviderButtonProps } from './provider-button';
import type { ProviderButtonGroupProps } from './provider-button-group';

export default {
  name: 'ProviderButton',
  description:
    'A full-width outline button that starts sign-in with a third-party provider. While pending, a spinner replaces the icon and the labels stay put. `ProviderButtonGroup` lays several out and picks which label each shows.',
  useFor: [
    'a sign in with Google, GitHub or another provider button',
    'a row or stack of social sign-in buttons',
    'marking the provider used last',
  ],
  keywords: ['provider', 'social', 'oauth', 'sso', 'sign in with', 'continue with', 'web3'],
  practices: [
    {
      do: true,
      text: 'Pass both `longLabel` and `shortLabel`. The group picks one from how many buttons share a row.',
    },
    {
      do: true,
      text: 'Make each `ProviderButton` a direct child of `ProviderButtonGroup`; put the last-used one in `lastUsed`.',
    },
    { do: true, text: 'Disable the group while any provider is pending, so the other buttons wait.' },
    { do: true, text: 'Pass a localized `pendingLabel`. The default is English.' },
    { do: false, text: 'Use `Button` or `SubmitButton` for a provider sign-in.' },
  ],
  parts: {
    ProviderButton: {
      description:
        'A `Button` with the icon, both labels and an optional badge. Takes every `Button` prop but `shape`. While `isPending` it goes inert and `aria-busy`, and carries `data-pending`.',
      slot: 'cl-button',
      props: {
        icon: { type: 'React.ReactNode', doc: "The provider's icon. The spinner takes its place while pending." },
        longLabel: {
          type: 'string',
          doc: 'The full call to action, such as `Continue with Google`. Also the accessible name.',
        },
        shortLabel: { type: 'string', doc: "The provider's name, shown when two buttons share a row." },
        badge: {
          type: 'string',
          doc: 'Short text on the top edge, such as `Last used`. Added to the accessible name.',
        },
        isPending: { type: 'boolean', doc: 'Marks the sign-in as running.', default: 'false' },
        pendingLabel: {
          type: 'string',
          doc: 'The spinner name, added to the accessible name while pending.',
          default: "'pending'",
        },
        spinDelay: { type: 'SpinDelayOptions', doc: 'When the spinner shows and how long it stays.' },
        size: { type: "'xs' | 'sm' | 'md' | 'lg'", doc: '`xs`, `sm`, `md` or `lg`.', default: "'md'" },
      },
    },
    ProviderButtonGroup: {
      description: 'A `div` that lays out its `ProviderButton` children and passes `disabled` down to them.',
      slot: 'cl-provider-button-group',
      props: {
        layout: {
          type: "'inline' | 'stacked'",
          doc: '`inline` fills rows of up to five, showing the long label for one button, the short label for two, the icon alone for three or more. `stacked` gives each its own row with the long label.',
          default: "'inline'",
        },
        disabled: {
          type: 'boolean',
          doc: 'Disables every button. A pending button keeps full opacity.',
          default: 'false',
        },
        lastUsed: {
          type: 'React.ReactNode',
          doc: 'The provider used last, on its own row above the others with its long label.',
        },
      },
    },
  },
  examples: [
    {
      title: 'A group',
      code: `
<ProviderButtonGroup disabled={isBusy}>
  <ProviderButton icon={<GoogleIcon />} longLabel='Continue with Google' shortLabel='Google' />
  <ProviderButton icon={<GitHubIcon />} longLabel='Continue with GitHub' shortLabel='GitHub' />
</ProviderButtonGroup>
`,
    },
  ],
  related: ['Button', 'useSpinDelay'],
} satisfies ComponentDoc<{ ProviderButton: ProviderButtonProps; ProviderButtonGroup: ProviderButtonGroupProps }>;
