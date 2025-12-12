---
title: '`UserSettings.saml` renamed to `enterpriseSSO`'
matcher: 'UserSettings[\\s\\S]*?saml'
matcherFlags: 'm'
category: 'deprecation-removal'
---

The `saml` property on `UserSettings` has been renamed to `enterpriseSSO`:

```diff
- userSettings.saml
+ userSettings.enterpriseSSO
```
