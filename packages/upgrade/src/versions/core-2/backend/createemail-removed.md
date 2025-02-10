---
title: '`createEmail` import removed'
matcher: "import\\s+{[^}]*?createEmail[\\s\\S]*?}\\s+from\\s+['\"]@clerk\/backend['\"]"
matcherFlags: 'm'
---

The `createEmail` import has been removed. There is no replacement at this time because we need to rethink how `createEmail` behaves and align it with the newer `sendSms` method. If this is an issue for your implementation, please contact [Clerk support](https://clerk.com/contact).
