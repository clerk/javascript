---
"@clerk/vue": minor
---

Replaced callback props with event emitters in billing buttons:

props `onSubscriptionComplete` → emit `subscription-complete`  
props `onSubscriptionCancel`   → emit `subscription-cancel`
