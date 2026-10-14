export const organizationSwitcherMessages = {
  trigger: {
    open: 'Open organization menu for {name}',
  },
  popup: {
    label: 'Organizations',
  },
  organizations: {
    personal: 'Personal account',
    notSelected: 'No organization selected',
    loading: 'Loading organizations…',
    members: { one: '{count} member', other: '{count} members' },
    accept: 'Accept',
    join: 'Join',
    requested: 'Requested',
    pending: 'pending',
  },
  manage: {
    invite: 'Invite',
    settings: 'Settings',
    organizationSettings: 'Organization settings',
    profileSettings: 'Profile settings',
    account: 'Manage account',
    organization: 'Manage organization',
    createOrganization: 'Create organization',
  },
} as const;
