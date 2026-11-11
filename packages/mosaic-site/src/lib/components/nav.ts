export type NavSection = {
  label: string;
  groups: { label: string; slugs: string[] }[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Account',
    groups: [{ label: '', slugs: ['user-button', 'user-profile', 'user-avatar', 'api-keys'] }],
  },
  {
    label: 'Authentication',
    groups: [
      {
        label: '',
        slugs: ['sign-in', 'sign-up', 'google-one-tap', 'waitlist', 'task-reset-password', 'task-setup-mfa'],
      },
    ],
  },
  {
    label: 'Multi-tenancy',
    groups: [
      {
        label: '',
        slugs: [
          'organization-switcher',
          'organization-list',
          'create-organization',
          'organization-profile',
          'task-choose-organization',
        ],
      },
    ],
  },
  {
    label: 'Billing',
    groups: [{ label: '', slugs: ['pricing-table', 'plan-details', 'checkout', 'subscription-details'] }],
  },
  {
    label: 'AI',
    groups: [{ label: '', slugs: ['oauth-consent', 'agent-approval'] }],
  },
];
