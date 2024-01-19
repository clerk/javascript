---
title: '`afterSignOutUrl` prop behavior change'
matcher: 'afterSignOutUrl='
warning: true
---

The default value of `afterSignOutUrl` has been changed to `/`. The URLs defined in your `Dashboard > Account Portal > Redirects` section will no longer affect these values. Read the [Customizing your Account Portal redirects](https://clerk.com/docs/account-portal/custom-redirects) guide to learn how to override these defaults. If you are setting the value to `/`, you can remove the prop entirely.
