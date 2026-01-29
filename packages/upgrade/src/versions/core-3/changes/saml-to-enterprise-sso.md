---
title: '`saml` strategy renamed to `enterprise_sso`'
matcher: 'saml'
category: 'deprecation-removal'
---

The `saml` authentication strategy has been renamed to `enterprise_sso`. Update any references in your code:

```diff
- strategy: 'saml'
+ strategy: 'enterprise_sso'
```
