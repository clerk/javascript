---
'@clerk/clerk-js': patch
---

Bug fix: When the requested Web3 provider cannot be found, use any other available injected Web3 Wallet provider, instead of blocking the sign-in/sign-up flow.
