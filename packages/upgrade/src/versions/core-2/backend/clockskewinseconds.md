---
title: '`clockSkewInSeconds` -> `clockSkewInMs`'
matcher:
  - "verifyJwt\\([\\s\\S]*?(clockSkewInSeconds):[\\s\\S]*?\\)"
  - "verifyToken\\([\\s\\S]*?(clockSkewInSeconds):[\\s\\S]*?\\)"
  - "authenticateRequest\\([\\s\\S]*?(clockSkewInSeconds):[\\s\\S]*?\\)"
matcherFlags: 'm'
category: 'skip'
replaceWithString: 'clockSkewInMs'
---

The `clockSkewInSeconds` option has been renamed to `clockSkewInMs` in order to accurately reflect that its value is expected to be in milliseconds rather than seconds. The value does not need to change here, only the name. This change affects the following imports:

- `verifyJwt`
- `verifyToken`
- `Clerk.authenticateRequest`
