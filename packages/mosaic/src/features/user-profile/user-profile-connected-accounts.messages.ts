export const userProfileConnectedAccountsMessages = {
  title: 'Connected accounts',
  connect: 'Connect',
  connectLabel: 'Connect {provider}',
  reconnect: 'Reconnect',
  disconnected: 'Disconnected',
  manageLabel: 'Manage {provider}',
  remove: 'Remove',
  removeDialog: {
    title: 'Remove connected account',
    description:
      '{provider} will be removed from this account. You will no longer be able to use this connected account and any dependent features will no longer work.',
    confirm: 'Remove',
    cancel: 'Cancel',
  },
} as const;
