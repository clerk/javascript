import { useMemo } from 'react';

import { useDebouncedAsync } from '../../hooks/use-debounced-async';
import type { SwitcherTriggerBadge } from './switcher.types';

export function useSwitcherTriggerController({
  kind,
  id,
  sessionId,
  triggerBadge,
  showTriggerLabel,
}: {
  kind: 'user' | 'organization' | 'none';
  id: string | undefined;
  sessionId: string;
  triggerBadge: SwitcherTriggerBadge;
  showTriggerLabel: boolean;
}) {
  const shouldRequestBadge = showTriggerLabel && typeof triggerBadge === 'function';
  const request = useMemo(
    () => (kind !== 'none' && id ? { options: { kind, id }, sessionId } : undefined),
    [kind, id, sessionId],
  );

  const result = useDebouncedAsync(
    request,
    async value => (value && typeof triggerBadge === 'function' ? triggerBadge(value.options) : undefined),
    { delayMs: 0, enabled: shouldRequestBadge && request !== undefined },
  );

  return { badge: result.isPending ? undefined : result.data };
}
