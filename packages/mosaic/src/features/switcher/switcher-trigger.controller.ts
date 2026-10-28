import { useMemo } from 'react';

import { useDebouncedAsync } from '../../hooks/use-debounced-async';
import type { SwitcherTriggerBadge } from './switcher.types';

export function useSwitcherTriggerController({
  kind,
  id,
  sessionId,
  renderTriggerBadge,
  renderTriggerLabel,
}: {
  kind: 'user' | 'organization' | 'none';
  id: string | undefined;
  sessionId: string;
  renderTriggerBadge: SwitcherTriggerBadge;
  renderTriggerLabel: boolean;
}) {
  const shouldRequestBadge = renderTriggerLabel && typeof renderTriggerBadge === 'function';
  const request = useMemo(
    () => (kind !== 'none' && id ? { options: { kind, id }, sessionId } : undefined),
    [kind, id, sessionId],
  );

  const result = useDebouncedAsync(
    request,
    async value => (value && typeof renderTriggerBadge === 'function' ? renderTriggerBadge(value.options) : undefined),
    { delayMs: 0, enabled: shouldRequestBadge && request !== undefined },
  );

  return { badge: result.isPending ? undefined : result.data };
}
