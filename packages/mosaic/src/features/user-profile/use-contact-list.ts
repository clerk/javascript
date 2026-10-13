import { useRef } from 'react';

import { usePendingAction } from '../../hooks/use-pending-action';
import { useSpinDelay } from '../../hooks/use-spin-delay';
import { useStableOrder } from '../../primitives/hooks';
import type { UserProfileContact } from './user-profile-contact.types';

const byId = (item: UserProfileContact) => item.id;

export function useContactList<T extends UserProfileContact>({
  items,
  onSetPrimary,
}: {
  items: T[];
  onSetPrimary: (id: string) => Promise<void>;
}) {
  const ordered = useStableOrder(items, byId);
  const primary = usePendingAction();
  const shownPendingId = useSpinDelay(primary.pendingKey ?? null) ?? undefined;
  const holding = shownPendingId !== undefined;
  const held = useRef(ordered);
  if (!holding) {
    held.current = ordered;
  }

  return {
    items: holding ? held.current : ordered,
    pendingId: primary.pendingKey,
    shownPendingId,
    error: primary.error,
    setPrimary: (id: string) => {
      if (!holding) {
        void primary.run(id, () => onSetPrimary(id));
      }
    },
  };
}
