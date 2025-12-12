---
title: '`Client.activeSessions` removed'
matcher: '\\.activeSessions'
category: 'deprecation-removal'
---

The `activeSessions` property has been removed from the `Client` object. Use `sessions` instead:

```diff
- const sessions = client.activeSessions;
+ const sessions = client.sessions;
```
