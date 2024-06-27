---
title: '`CLERK_JS_VERSION` should be `NEXT_PUBLIC_CLERK_JS_VERSION`'
category: 'deprecation-removal'
matcher: '^[^_]*CLERK_JS_VERSION'
---

If you are using `CLERK_JS_VERSION` as an environment variable, it should be changed to `NEXT_PUBLIC_CLERK_JS_VERSION` instead.

This change brings our SDK up to date with the latest standards for next.js - that public environment variables should have the `NEXT_PUBLIC_` prefix. This env variable is not private, so it should get the public prefix.
