import { z } from 'zod';

import { ClerkTool } from '../clerk-tool';
import { prunePrivateData } from '../utils';

const createInvitation = ClerkTool({
  name: 'createInvitation',
  description: `
    Creates a new invitation for a specified email address to join your application.
    Use this tool when you need to send invitation emails to new users.

    The invited email will receive an email with a sign-up link.
    You can customize the redirect URL and attach public metadata to the invitation.

    Example use cases:
    1. Implementing a user invitation system for a private beta
    2. Creating a closed registration system where only invited users can join
    3. Pre-configuring user attributes via publicMetadata before they sign up
  `,
  parameters: z.object({
    emailAddress: z.string().describe('(string): Email address to send the invitation to. Required.'),
    redirectUrl: z
      .string()
      .optional()
      .describe('(string, optional): URL to redirect users to after they accept the invitation.'),
    publicMetadata: z
      .record(z.string(), z.any())
      .optional()
      .describe('(Record<string,any>, optional): Public metadata for the invitation.'),
    notify: z
      .boolean()
      .optional()
      .describe('(boolean, optional): Whether to send an email notification. Defaults to true.'),
    ignoreExisting: z
      .boolean()
      .optional()
      .describe('(boolean, optional): Whether to ignore if an invitation already exists. Defaults to false.'),
  }),
  bindRunnable: (clerkClient, context) => async params => {
    const res = await clerkClient.invitations.createInvitation(params);
    return prunePrivateData(context, res.raw);
  },
});

const revokeInvitation = ClerkTool({
  name: 'revokeInvitation',
  description: `
    Revokes a pending invitation, preventing the recipient from using it to sign up.
    Use this tool when you need to cancel an invitation before it's accepted.

    This immediately invalidates the invitation link sent to the user.
    Once revoked, an invitation cannot be un-revoked; you would need to create a new invitation.

    Example use cases:
    1. Canceling invitations sent by mistake
    2. Revoking access when a prospective user should no longer be invited
    3. Implementing invitation management controls for administrators
  `,
  parameters: z.object({
    invitationId: z.string().describe('(string): The ID of the invitation to revoke. Required.'),
  }),
  bindRunnable: (clerkClient, context) => async params => {
    const res = await clerkClient.invitations.revokeInvitation(params.invitationId);
    return prunePrivateData(context, res.raw);
  },
});

export const invitations = {
  createInvitation,
  revokeInvitation,
} as const satisfies Record<string, ClerkTool>;
