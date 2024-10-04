import type { ClerkClient, Invitation } from '@clerk/backend';

export type InvitationService = {
  createBapiInvitation: (emailAddress: string) => Promise<Invitation>;
};
export const createInvitationService = (clerkClient: ClerkClient) => {
  const self: InvitationService = {
    createBapiInvitation: async emailAddress => {
      return await clerkClient.invitations.createInvitation({
        emailAddress,
      });
    },
  };

  return self;
};
