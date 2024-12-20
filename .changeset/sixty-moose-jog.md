---
'@clerk/clerk-react': minor
---

Allow `<SignInButton />`, <SignUpButton />`, `<SignOutButton />`, and `<SignInWithMetamaskButton />` to render while clerk-js is still loading. This reduces any layout shift that might be caused by these components not rendering immediately.
