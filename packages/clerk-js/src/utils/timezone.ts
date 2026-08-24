import { inBrowser } from '@clerk/shared/browser';

export function getBrowserTimezone(): string | null {
  if (!inBrowser()) {
    return null;
  }
  try {
    const timezone = Intl?.DateTimeFormat?.().resolvedOptions().timeZone;
    return typeof timezone === 'string' && timezone.trim() ? timezone : null;
  } catch {
    return null;
  }
}
