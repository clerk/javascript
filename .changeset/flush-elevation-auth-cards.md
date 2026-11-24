---
'@clerk/mosaic': minor
---

`SignInView`, `SignUpView` and `OAuthConsent` accept an `elevation` prop. Passing `'flush'` drops the card's surface and the padding around it, so the component sits flush on the page. `Card` with `elevation='flush'` now also removes its inner padding and footer divider.
