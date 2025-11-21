import type { ClerkClient } from '@clerk/backend';

export type WaitlistService = {
  clearWaitlistByEmail: (email: string) => Promise<void>;
};

export const createWaitlistService = (clerkClient: ClerkClient) => {
  const self: WaitlistService = {
    clearWaitlistByEmail: async (email: string) => {
      const { data: entries } = await clerkClient.waitlistEntries.list({ query: email, status: 'pending' });

      if (entries.length > 0) {
        await clerkClient.waitlistEntries.delete(entries[0].id);
      }
    },
  };

  return self;
};
