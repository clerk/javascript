---
'@clerk/localizations': patch
'@clerk/clerk-js': patch
'@clerk/types': patch
---

- Break out subscriptions and plans into different pages within `UserProfile` and `OrgProfile`
- Display free plan row when "active" and plan has features
- Tidy up design of subscription rows and badging
- Adds `SubscriptionDetails` support for plans without a current subscription
