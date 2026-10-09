import { clerkDevelopmentCache, createConfirmationMessage } from './devCache';
import type { AccountlessApplication } from './types';

interface CompletionService {
  completeOnboarding: () => Promise<AccountlessApplication | null>;
}

/**
 * Notifies the backend that a claimed keyless application is running with its keys
 * configured (cached to once per 24 hours) and logs the one-time claim confirmation.
 * Resolves even when the completion request fails.
 */
export async function completeClaimedOnboarding(publishableKey: string, service: CompletionService): Promise<void> {
  try {
    await clerkDevelopmentCache?.run(() => service.completeOnboarding(), {
      cacheKey: `${publishableKey}_complete`,
      onSuccessStale: 24 * 60 * 60 * 1000, // 24 hours
    });
  } catch {
    // noop
  }

  clerkDevelopmentCache?.log({
    cacheKey: `${publishableKey}_claimed`,
    msg: createConfirmationMessage(),
  });
}
