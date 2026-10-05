---
'@clerk/backend': minor
---

Add `clerkClient.invitations.deleteInvitation(invitationId)`, which permanently deletes an instance invitation and the stored copies of its invitation email. Unlike `revokeInvitation`, this removes the invitation record itself, so it can be used to honor a data erasure request from someone who was invited but never signed up.
