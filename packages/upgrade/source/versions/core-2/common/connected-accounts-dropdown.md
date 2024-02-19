---
title: 'Within `<UserProfile />`, Connected Accounts Added via Dropdown'
matcher: '(?:<UserProfile|<UserButton)'
category: 'appearance'
warning: true
image: true
---

Within the `<UserProfile />` component (which is also rendered by `<UserButton />`), adding a connected account is now rendered as a dropdown instead of a modal. If you were relying on the modal for any sort of customizations, these customizations will need to be adjusted to the new form factor.

New appearance prop keys were added to aid with customization, if desired:

- `cl-menuList__connectedAccounts` for styling the list of connected account addition options
- `cl-menuItem__connectedAccounts` for styling individual items in the connected account options list
- `cl-menuList__web3Wallets` for styling the list of web3 wallet addition options
- `cl-menuItem__web3Wallets` for styling individual items in the web3 wallets options list
