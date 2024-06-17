---
title: "`Organization.create('x')` -> `Organization.create({ name: 'x' })`"
matcher: "Organization\\.create\\(\\s*[\"']"
matcherFlags: 'm'
---

Passing a string as an argument to `Organization.create` is no longer possible - instead, pass an object with the `name` property.

```diff
- Organization.create('...');
+ Organization.create({ name: '...' });
```
