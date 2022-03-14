// Usage:
// From examples/node, run files with "npm test ./src/invitations.ts"
import { invitations } from '@clerk/clerk-sdk-node';

// Create an invitation
await invitations.createInvitation({
  emailAddress: 'test@example.com',
  publicMetadata: {
    some_metadata: 'test',
    some_nested: {
      some_metadata: 'test',
    },
  },
});

// Create another invitation
const { id } = await invitations.createInvitation({
  emailAddress: 'will-be-revoked@example.com',
});

// Get invitation list
const invitationList = await invitations.getInvitationList();
console.log(invitationList);

// Revoke the last invitation
const revokedInvitation = await invitations.revokeInvitation(String(id));
console.log(revokedInvitation);
