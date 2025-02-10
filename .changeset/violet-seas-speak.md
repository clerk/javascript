---
'@clerk/backend': minor
---

Deprecate usage of the `oauth_` prefix in `client.users.getUserOauthAccessToken()`. Going forward, please use the provider name without that prefix. Example:

```diff
- client.users.getUserOauthAccessToken('user_id', 'oauth_google')
+ client.users.getUserOauthAccessToken('user_id', 'google')
```
