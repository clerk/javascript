---
'@clerk/ui': patch
---

Fix the "Set as default" action for SMS second factors in `<UserProfile />`. It now prompts for reverification when required instead of showing a raw error, and it's no longer offered while an authenticator app is enrolled, since the authenticator app is always the default in that case.
