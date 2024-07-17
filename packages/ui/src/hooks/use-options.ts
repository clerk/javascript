import { useClerk } from '@clerk/clerk-react';
import type { ClerkOptions } from '@clerk/types';

export function useOptions() {
  const clerk = useClerk();
  const options = (clerk as any)?.options as ClerkOptions;
  return options;
}
