---
'@clerk/clerk-react': patch
---

Update `SignUpButton` and `SignInButton` to respect `forceRedirect` and `fallbackRedirect` props. Previously, these were getting ignored and successful completions of the flows would fallback to the default redirect URL.
