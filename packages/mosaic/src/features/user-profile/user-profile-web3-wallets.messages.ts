export const userProfileWeb3WalletsMessages = {
  title: 'Web3 wallets',
  connect: 'Connect',
  connectLabel: 'Connect {provider}',
  manageLabel: 'Manage {wallet}',
  remove: 'Remove wallet',
  setPrimary: 'Set as primary',
  primary: 'Primary',
  unverified: 'Unverified',
  solanaDialog: {
    back: 'Back',
    title: 'Select a Solana wallet',
    description: 'Choose an installed wallet to connect to your account.',
    noneAvailable: 'No Solana wallets are available.',
    findWallet: 'Find a Solana wallet',
    cancel: 'Cancel',
  },
  removeDialog: {
    title: 'Remove wallet?',
    description: '{wallet} will be removed from this account.',
    verifiedDescription:
      '{wallet} will be removed from this account. You will no longer be able to sign in using this web3 wallet.',
    confirm: 'Remove',
    cancel: 'Cancel',
  },
} as const;
