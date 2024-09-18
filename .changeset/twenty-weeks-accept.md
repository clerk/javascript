---
"@clerk/clerk-js": patch
---

Restore behavior of MetaMask compatible Web3 wallets. Before, even if a user didn't use the MetaMask browser extension but a compatible one, such as Rabby Wallet, it was possible to use it as they share the same API to authenticate themselves. This behavior stopped working when we added support for EIP6963 regarding handling multiple injected providers. This commit restores the previous behavior by using the existing injected provider if there is a single one
