---
title: 'Identity preview avatar customization ids removed'
image: true
matcherFlags: 'm'
category: 'appearance'
matcher:
  - "\\.cl-identityPreviewAvatarBox"
  - "\\.cl-identityPreviewAvatarImage"
  - "elements:\\s+{[\\s\\S]*?identityPreviewAvatarBox:[\\s\\S]*?}"
  - "elements:\\s+{[\\s\\S]*?identityPreviewAvatarImage:[\\s\\S]*?}"
---

When signing in with Clerk's `<SignIn />` component, after entering a username or email the user is brought to a second pane where they can enter a second factor such as a password. On this pane, there is an area called "identity preview" that shows the username/email that they are entering a password/etc for. Previously, this area included the user's avatar, but this is no longer the case in updated designs. As such, the customization ids related to the user's avatar have been removed.
