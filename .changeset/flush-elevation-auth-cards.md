---
'@clerk/mosaic': minor
---

`SignInView`, `SignUpView` and `OAuthConsent` accept an `elevation` prop, and `SignInView` and `SignUpView` accept `renderBranding`. Passing `'flush'` drops the card's surface and the padding around it, so the component sits flush on the page. `Card` with `elevation='flush'` now also removes its inner padding and footer divider and fills the width of its container up to the card's `size` width. Set `--cl-card-flush-max-width` to change that cap.
