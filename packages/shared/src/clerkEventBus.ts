import type { ClerkEventPayload } from '@clerk/types';

import { createEventBus } from './eventBus';

export const clerkEvents = {
  Status: 'status',
  ResourceAction: 'resource:action',
} satisfies Record<string, keyof ClerkEventPayload>;

export const createClerkEventBus = () => {
  return createEventBus<ClerkEventPayload>();
};
