export type NavSection = {
  label: string;
  groups: { label: string; slugs: string[] }[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Authentication',
    groups: [
      { label: 'Account', slugs: ['user-button', 'user-profile', 'user-avatar', 'api-keys'] },
      { label: 'Sign in', slugs: ['sign-in', 'sign-up', 'google-one-tap', 'waitlist'] },
      {
        label: 'Tasks',
        slugs: ['task-reset-password', 'task-setup-mfa'],
      },
    ],
  },
  {
    label: 'Multi-tenancy',
    groups: [
      {
        label: 'Organizations',
        slugs: ['organization-switcher', 'organization-list', 'create-organization', 'organization-profile'],
      },
      { label: 'Tasks', slugs: ['task-choose-organization'] },
    ],
  },
  {
    label: 'Billing',
    groups: [
      { label: 'Plans', slugs: ['pricing-table', 'plan-details'] },
      { label: 'Payments', slugs: ['checkout', 'subscription-details'] },
    ],
  },
  {
    label: 'AI',
    groups: [
      { label: 'OAuth consent', slugs: ['oauth-consent'] },
      { label: 'Agent approvals', slugs: ['agent-approval'] },
    ],
  },
];
