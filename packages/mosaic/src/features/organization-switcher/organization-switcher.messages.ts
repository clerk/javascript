export const organizationSwitcherMessages = {
  trigger: {
    open: 'Open {organization} menu for {name}',
  },
  popup: {
    label: '{Organizations}',
  },
  organizations: {
    personal: 'Personal account',
    notSelected: 'No {organization} selected',
    loading: 'Loading {organizations}…',
    members: { one: '{count} member', other: '{count} members' },
    accept: 'Accept',
    join: 'Join',
    requested: 'Requested',
    pending: 'pending',
  },
  manage: {
    invite: 'Invite members',
    settings: 'Settings',
    profile: 'Manage profile',
    organization: 'Manage {organization}',
    createOrganization: 'Add {organization}',
  },
} as const;
