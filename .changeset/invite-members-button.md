---
'@clerk/clerk-js': minor
'@clerk/shared': minor
'@clerk/react': minor
'@clerk/nextjs': minor
'@clerk/ui': minor
---

Add `<InviteMembersButton />`, a control component that opens the organization invite-members form in a modal when clicked, working like `<SignInButton mode="modal">`.

Wrap your own button (or omit children for a default one). The button requires an active organization and should be rendered for members who can manage memberships (`org:sys_memberships:manage`).

```tsx
import { InviteMembersButton } from '@clerk/nextjs';

<InviteMembersButton>
  <button>Invite members</button>
</InviteMembersButton>;
```

This also adds `Clerk.openInviteMembers()` and `Clerk.closeInviteMembers()` for opening and closing the modal programmatically.
