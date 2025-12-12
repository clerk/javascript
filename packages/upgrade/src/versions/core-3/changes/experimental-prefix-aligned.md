---
title: 'Experimental method prefix standardized to `__experimental_`'
matcher:
  - 'experimental__'
  - 'experimental_'
category: 'breaking'
---

All experimental methods now use the `__experimental_` prefix consistently. Update any references:

```diff
- experimental__someMethod
+ __experimental_someMethod

- experimental_someMethod
+ __experimental_someMethod
```
