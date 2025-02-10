---
title: '`afterSignXUrl` changes'
matcher:
  - 'CLERK_AFTER_SIGN_IN_URL'
  - 'CLERK_AFTER_SIGN_UP_URL'
  - "<ClerkProvider[\\s\\S]*?(afterSignInUrl)=[\\s\\S]*?>"
  - "<ClerkProvider[\\s\\S]*?(afterSignUpUrl)=[\\s\\S]*?>"
  - "<ClerkProvider[\\s\\S]*?(redirectUrl)=[\\s\\S]*?>"
  - "<SignIn[\\s\\S]*?(afterSignInUrl)=[\\s\\S]*?>"
  - "<SignIn[\\s\\S]*?(afterSignUpUrl)=[\\s\\S]*?>"
  - "<SignIn[\\s\\S]*?(redirectUrl)=[\\s\\S]*?>"
  - "<SignUp[\\s\\S]*?(afterSignInUrl)=[\\s\\S]*?>"
  - "<SignUp[\\s\\S]*?(afterSignUpUrl)=[\\s\\S]*?>"
  - "<SignUp[\\s\\S]*?(redirectUrl)=[\\s\\S]*?>"
category: 'after-sign-x-url-changes'
matcherFlags: 'm'
---

Some changes are being made to the way that "after sign up/in url"s and redirect url props are handled as part of this new version, in order to make behavior more clear and predictable.

> We will refer to these urls as `afterSignXUrl` where `X` could be `Up` or `In` depending on the context.

Previously, setting `afterSignInUrl` or `afterSignOutUrl` would only actually redirect some of the time. If the user clicks on any form of link that takes them to a sign up/in page, Clerk automatically sets `redirect_url` in the querystring such that after the sign up or in, the user is returned back to the page they were on before. This is a common pattern for sign up/in flows, as it leads to the least interruption of the user's navigation through your app. When a `redirect_url` is present, any value passed to `afterSignInUrl` or `afterSignUpUrl` is ignored. However, if the user navigates directly to a sign up/in page, there’s no redirect url in the querystring and in this case the `afterSignInUrl` or `afterSignOutUrl` would take effect. This behavior was not intuitive and didn't give a way to force a redirect after sign up/in, so the behavior is changing to address both of these issues.

All `afterSignXUrl` props and `CLERK_AFTER_SIGN_X_URL` environment variables have been removed, and should be replaced by one of the following options:

- `signXForceRedirectUrl` / `CLERK_SIGN_X_FORCE_REDIRECT_URL` - if set, Clerk will always redirect to provided URL, regardless of what page the user was on before. Use this option with caution, as it will interrupt the user’s flow by taking them away from the page they were on before.
- `signXFallbackRedirectUrl` / `CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` - if set, this will mirror the previous behavior, only redirecting to the provided URL if there is no `redirect_url` in the querystring.

If neither value is set, Clerk will redirect to the `redirect_url` if present, otherwise it will redirect to `/`. If you'd like to retain the current behavior of your app without any changes, you can switch `afterSignXUrl` with `signXFallbackRedirectUrl` as such:

```diff
- <SignIn afterSignInUrl='/foo' afterSignUpUrl='/bar' />
+ <SignIn fallbackRedirectUrl='/foo' signUpFallbackRedirectUrl='/bar' />
```
