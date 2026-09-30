---
'@clerk/ui': patch
'@clerk/clerk-js': patch
---

The Solana wallet picker downloads about 2 KB instead of about 306 KB, and installing `@clerk/ui` or `@clerk/clerk-js` no longer pulls in React Native, Metro, and `@solana/web3.js`. The picker now lists only wallets that can complete Sign in with Solana, so the Mobile Wallet Adapter option that appeared on Android Chrome is gone.
