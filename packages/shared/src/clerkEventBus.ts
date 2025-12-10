import { createEventBus } from './eventBus';
import type { ClerkEventPayload } from './types';

export const clerkEvents = {
  Status: 'status',
} satisfies Record<string, keyof ClerkEventPayload>;

export const createClerkEventBus = () => {
  return createEventBus<ClerkEventPayload>();
};
