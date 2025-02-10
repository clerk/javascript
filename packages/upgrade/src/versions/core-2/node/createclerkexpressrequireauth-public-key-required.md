---
title: '`createClerkExpressRequireAuth` requires publishable key'
matcher: 'createClerkExpressRequireAuth'
warning: true
---

The `createClerkExpressRequireAuth` method now requires a clerk public key in order to work correctly. It can be passed in as a parameter directly, or picked up via environment variable. An error will be thrown now if there's no public key provided, this was not previously the case.
