---
'@clerk/clerk-js': minor
'@clerk/shared': minor
'@clerk/react': minor
---

Add a way to supply a Clerk Protect assertion from your application, so a token minted by your own backend reaches Protect without your having to set a cookie.

A Protect assertion is a short-lived, signed token you create with the Clerk Backend API, carrying key/value pairs your Protect rules can read. Until now the only way to deliver one was the `__clerk_protect_assertion` cookie, which requires your app and Frontend API to be on the same site — true with a production CNAME setup, but not on development instances.

Pass the token to Clerk and it is attached to sign-in and sign-up requests instead:

```ts
// A token you already have.
Clerk.load({ protectAssertion: token });

// Or a function, re-read for each request.
Clerk.load({ protectAssertion: () => sessionStorage.getItem('protect_assertion') ?? undefined });

// Or set it later, once your app has fetched one.
clerk.setProtectAssertion(token);
```

Prefer the function form when a page can outlive the token. Assertions are short-lived by design, so a string captured at load time stops applying once it expires, whereas a function picks up a refreshed one.

An assertion is an input to rules you author, never a decision on its own, and it applies only from the context you constrained it to when you minted it. Nothing about it can fail a sign-in: a resolver that throws, rejects, or returns anything other than a non-empty string simply results in no assertion being attached, and the request proceeds.

The cookie continues to work unchanged. If both are present, the value supplied to the SDK wins.
