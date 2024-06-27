---
title: '`redirect_url` -> `redirectUrl` as param of `User.createExternalAccount`'
matcher: "createExternalAccount\\(\\s*{[\\s\\S]*?(redirect_url):[\\s\\S]*?\\)"
category: 'deprecation-removal'
replaceWithString: 'redirectUrl'
---

The param `redirect_url` of [`User.createExternalAccount`](https://clerk.com/docs/references/javascript/user/create-metadata#create-external-account) has been updated to `redirectUrl`. This is a simple text replacement without any signature changes.
