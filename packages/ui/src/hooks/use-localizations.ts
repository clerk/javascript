import { useClerk } from '@clerk/clerk-react';
import { enUS } from '@clerk/localizations';
import type { ClerkOptions } from '@clerk/types';

import { makeLocalizeable } from '~/utils/makeLocalizable';

export function useLocalizations() {
  const clerk = useClerk();
  const { t, translateError } = makeLocalizeable(((clerk as any)?.options as ClerkOptions)?.localization || enUS);
  return { t, translateError };
}
