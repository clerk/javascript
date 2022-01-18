// Usage:
// From examples/node, transpile files by running `tsc`
// To run:
// node --require dotenv/config dist/invitations.js

import { invitations,setClerkServerApiUrl } from '@clerk/clerk-sdk-node';

const serverApiUrl = process.env.CLERK_API_URL || '';

setClerkServerApiUrl(serverApiUrl);

// Create an invitation
await invitations.createInvitation({
  emailAddress: 'test@example.com',
});

// Create another invitation
const { id } = await invitations.createInvitation({
  emailAddress: 'will-be-revoked@example.com',
});

// Revoke the last invitation
await invitations.revokeInvitation(String(id));

// Get invitation list
let invitationList = await invitations.getInvitationList();
console.log(invitationList);
