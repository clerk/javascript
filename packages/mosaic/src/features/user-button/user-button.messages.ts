export const userButtonMessages = {
  trigger: {
    open: 'Open account menu for {name}',
  },
  popup: {
    label: 'Account',
  },
  organizations: {
    personal: 'Personal account',
    notSelected: 'No organization selected',
    loading: 'Loading organizations…',
    members: { one: '{count} member', other: '{count} members' },
    accept: 'Accept',
    join: 'Join',
    requested: 'Requested',
    /** Names the pending indicator on a row and inside the accept and join buttons, read beside the label. */
    pending: 'pending',
  },
  groups: {
    organizations: 'Organizations',
    organization: 'Organization actions',
    account: 'Account actions',
  },
  accounts: {
    label: 'Session actions',
    switch: 'Switch account',
    add: 'Add account',
    signOut: 'Sign out',
    signOutAll: 'Sign out of all accounts',
  },
  manage: {
    invite: 'Invite members',
    settings: 'Settings',
    profile: 'Manage profile',
    organization: 'Manage organization',
    createOrganization: 'Add organization',
  },
} as const;
