import { clerkClient } from './clerk-client';
import type { CreateClerkToolkitParams } from './types';

export const defaultCreateClerkToolkitParams = {
  allowPrivateMetadata: false,
  clerkClient,
} satisfies CreateClerkToolkitParams;
