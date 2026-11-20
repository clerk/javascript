export type { ActionBlockedDetails } from '@clerk/shared/internal/clerk-js/actionBlocked';
export { actionBlockedDetailsFrom, getActionBlockedDetails } from '@clerk/shared/internal/clerk-js/actionBlocked';

export const safeHref = (url: string | undefined): string | null => {
  if (!url) {
    return null;
  }
  try {
    return new URL(url).protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
};
