---
'@clerk/clerk-js': patch
---

Always invoke an injected Web3 Wallet provider, if any, to allow the user to continue the flow rather than be a no-op
