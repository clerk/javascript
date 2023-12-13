---
'@clerk/clerk-js': major
'@clerk/clerk-react': major
'@clerk/types': patch
---

Drop `redirectToHome` redirect method in favour of `redirectToAfterSignUp` or `redirectToAfterSignIn`.

When the `<SignIn/>` and `<SignUp/>` components are rendered while a user is already logged in, they will now redirect to the configured `afterSignIn` and `afterSignUp` URLs, respectively. Previously, the redirect URL was set to the home URL configured in the dashboard.
