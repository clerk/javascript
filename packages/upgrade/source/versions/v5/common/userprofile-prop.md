---
title: '`userProfile` -> `userProfileProps` for `UserButton`'
matcher: "<UserButton[\\s\\S]*?(userProfile)=[\\s\\S]*?>"
matcherFlags: 'm'
replaceWithString: 'userProfileProps'
---

The `userProfile` prop on [the `UserButton` component](https://clerk.com/docs/references/javascript/clerk/user-button#user-button-component) has been changed to `userProfileProps`. This is purely a name change, none of the values need to be updated.

```diff
- <UserButton userProfile={} />
+ <UserButton userProfileProps={} />
```
