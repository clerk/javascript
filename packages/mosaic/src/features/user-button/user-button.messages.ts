export const userButtonMessages = {
  trigger: {
    open: 'Open account menu for {name}',
  },
  popup: {
    label: 'Account',
  },
  workspaces: {
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
  accounts: {
    actionsFor: 'Actions for {identifier}',
    switch: 'Switch account',
    add: 'Add account',
    signOut: 'Sign out',
    signOutAll: 'Sign out of all accounts',
  },
  manage: {
    invite: 'Invite',
    settings: 'Settings',
    account: 'Manage account',
    organization: 'Manage organization',
    createOrganization: 'Create organization',
  },
} as const;
