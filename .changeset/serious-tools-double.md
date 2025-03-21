---
'@clerk/clerk-js': minor
'@clerk/types': minor
---

Add support for the `oauthFlow` prop on `<SignIn />` and `<SignUp />`, allowing developers to opt-in to using a popup for OAuth authorization instead of redirects.

  With the new `oauthFlow` prop, developers can opt-in to using a popup window instead of redirects for their OAuth flows by setting `oauthFlow` to `"popup"`. While we still recommend the default `"redirect"` for most scenarios, the `"popup"` option is useful in environments where the redirect flow does not currently work, such as when your application is embedded into an `iframe`. We also opt applications into the `"popup"` flow when we detect that your application is running on a domain that's typically embedded into an `iframe`, such as `loveable.app`.
