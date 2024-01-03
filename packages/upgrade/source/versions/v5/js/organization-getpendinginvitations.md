---
title: "`Organization.getPendingInvitations()` -> `Organization.getInvitations({ status: 'pending' })`"
matcher: "\\.getPendingInvitations\\("
---

The `Organization.getPendingInvitations()` method has been removed. You can use `Organization.getInvitations` instead.

```js
// before
Organization.getPendingInvitations();

// after
Organization.getInvitations({ status: 'pending' });
```
