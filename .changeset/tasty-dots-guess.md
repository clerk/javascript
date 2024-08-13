---
"@clerk/clerk-js": patch
"@clerk/elements": patch
"@clerk/types": patch
"@clerk/ui": patch
---

In certain situations the Frontend API response contains [`supported_first_factors`](https://clerk.com/docs/reference/frontend-api/tag/Sign-Ins#operation/createSignIn!c=200&path=response/supported_first_factors&t=response) with a `null` value while the current code always assumed to receive an array. `SignInResource['supportedFirstFactors']` has been updated to account for that and any code accessing this value has been made more resilient against `null` values.
