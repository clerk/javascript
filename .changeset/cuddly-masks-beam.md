---
"@clerk/vue": minor
---

Replaced callback props with event emitters in billing buttons:

props `onSubscriptionComplete` → emit `subscriptionComplete`  
props `onSubscriptionCancel`   → emit `subscriptionCancel`
