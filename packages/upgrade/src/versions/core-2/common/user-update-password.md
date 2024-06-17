---
title: "`User.update({ password: 'x' })` -> `User.updatePassword('x')`"
matcher: "\\.update\\([\\s\\S]*?password:[\\s\\S]*?\\)"
category: 'deprecation-removal'
matcherFlags: 'm'
---

If you are updating a user's password via the [`User.update` method](https://clerk.com/docs/references/javascript/user/user#update), it must be changed to [`User.updatePassword`](https://clerk.com/docs/references/javascript/user/password-management#update-password) instead. This method will require the current password as well as the desired new password. We made this update to improve the security of password changes. Example below:

```diff
- user.update({ password: 'foo' });

+ user.updatePassword({
+   currentPassword: 'bar',
+   newPassword: 'foo',
+   signOutOfOtherSessions: true,
+ });
```
