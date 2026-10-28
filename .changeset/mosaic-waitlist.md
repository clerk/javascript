---
'@clerk/mosaic': minor
---

Add `<Waitlist />`, a card that adds an email address to the application's waitlist. It takes `afterJoinWaitlistUrl` and `signInUrl` like the existing `Waitlist` component, fills the email field from an `email_address` query parameter, and its strings can be overridden under the `waitlist` localization namespace.
