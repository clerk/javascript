---
'@clerk/clerk-js': patch
'@clerk/clerk-react': patch
---

Respect the `signInForceRedirectUrl`, `signInFallbackRedirectUrl`, `signUpForceRedirectUrl` and `signUpFallbackRedirectUrl` props passed to `SignInButton`, `SignUpButton` and the low-level `window.Clerk.buildSignInUrl` & `window.Clerk.buildSignUpUrl` methods. These props allow you to control the redirect behavior of the `SignIn` and `SignUp` components. For more information, refer to the [Custom Redirects](https://clerk.com/docs/guides/custom-redirects) guide.
