export type NavSection = {
  label: string;
  groups: { label: string; slugs: string[] }[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Account',
    groups: [{ label: '', slugs: ['user-button', 'user-profile', 'user-avatar'] }],
  },
  {
    label: 'Authentication',
    groups: [{ label: '', slugs: ['sign-in', 'waitlist', 'task-setup-mfa'] }],
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
          'invite-members-button',
          'task-choose-organization',
        ],
      },
    ],
  },
  {
    label: 'AI',
    groups: [{ label: '', slugs: ['oauth-consent'] }],
  },
];
