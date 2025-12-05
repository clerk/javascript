---
title: '`samlAccount` renamed to `enterpriseAccount`'
matcher: 'samlAccount'
category: 'deprecation-removal'
---

The `samlAccount` property has been renamed to `enterpriseAccount`. Update your code:

```diff
- user.samlAccounts
+ user.enterpriseAccounts

- verification.samlAccount
+ verification.enterpriseAccount
```
