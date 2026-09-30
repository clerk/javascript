---
'@clerk/ui': patch
'@clerk/clerk-js': patch
---

List Solana wallets through the Wallet Standard instead of `@solana/wallet-adapter-react`. `@clerk/ui` no longer depends on the Solana wallet adapter packages, which pulled in React Native, Metro, and `@solana/web3.js`, and the lazy-loaded Solana wallet chunk drops from about 306 KB to 2 KB. The list now shows exactly the wallets Clerk can sign in with. `@clerk/clerk-js` drops the same packages, which it listed but never imported.
