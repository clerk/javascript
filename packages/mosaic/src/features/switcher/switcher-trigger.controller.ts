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
  const request = useMemo(() => {
    const shouldRequestBadge = renderTriggerLabel && kind !== 'none' && id && typeof renderTriggerBadge === 'function';

    if (!shouldRequestBadge) {
      return undefined;
    }

    return { options: { kind, id }, resolve: renderTriggerBadge, sessionId };
  }, [kind, id, renderTriggerBadge, renderTriggerLabel, sessionId]);

  const result = useDebouncedAsync(request, async value => value?.resolve(value.options), {
    delayMs: 0,
    enabled: request !== undefined,
  });

  return { badge: result.isPending ? undefined : result.data };
}
