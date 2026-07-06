import { windowNavigate } from '@clerk/shared/internal/clerk-js/windowNavigate';
import type { Clerk } from '@clerk/shared/types';

type ClerkWindowNavigate = Clerk['__internal_windowNavigate'];
type ClerkWithOptionalWindowNavigate = Omit<Clerk, '__internal_windowNavigate'> & {
  __internal_windowNavigate?: ClerkWindowNavigate;
};

export function clerkWindowNavigate(
  clerk: Clerk,
  to: Parameters<ClerkWindowNavigate>[0],
  opts?: Parameters<ClerkWindowNavigate>[1],
): void {
  const clerkWindowNavigate = (clerk as ClerkWithOptionalWindowNavigate).__internal_windowNavigate;

  if (typeof clerkWindowNavigate === 'function') {
    return clerkWindowNavigate.call(clerk, to, opts);
  }

  // Older ClerkJS instances do not expose the central chokepoint. Fall back to the
  // static allowlist so newer UI paired with older ClerkJS still fails closed.
  return windowNavigate(to);
}
