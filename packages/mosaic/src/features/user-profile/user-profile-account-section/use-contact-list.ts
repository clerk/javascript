import { useRef, useState } from 'react';

import { useSpinDelay } from '../../../hooks/use-spin-delay';
import { useStableOrder } from '../../../primitives/hooks';

interface ContactItem {
  id: string;
  isDefault?: boolean;
  isVerified?: boolean;
}

const byId = (item: ContactItem) => item.id;

export function useContactList<T extends ContactItem>({
  items,
  onSetPrimary,
  primaryErrorMessage,
}: {
  items: T[];
  onSetPrimary?: (id: string) => void | Promise<void>;
  primaryErrorMessage: string;
}) {
  const row = useRef<HTMLDivElement>(null);
  const ordered = useStableOrder(items, byId);
  const [pendingPrimaryId, setPendingPrimaryId] = useState<string>();
  const shownPendingId = useSpinDelay(pendingPrimaryId ?? null) ?? undefined;
  const holding = shownPendingId !== undefined;
  const [held, setHeld] = useState(ordered);
  if (!holding && held !== ordered) {
    setHeld(ordered);
  }
  const shownItems = holding ? held : ordered;
  const [primaryError, setPrimaryError] = useState<string>();
  const settingPrimary = useRef(false);

  const setPrimary = async (id: string) => {
    const item = items.find(item => item.id === id);
    if (!onSetPrimary || !item?.isVerified || item.isDefault || settingPrimary.current) {
      return;
    }
    settingPrimary.current = true;
    setPendingPrimaryId(id);
    setPrimaryError(undefined);
    try {
      await onSetPrimary(id);
    } catch (error) {
      setPrimaryError(error instanceof Error ? error.message : primaryErrorMessage);
    } finally {
      settingPrimary.current = false;
      setPendingPrimaryId(undefined);
    }
  };

  const removalFallback = () =>
    Array.from(row.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])') ?? []).find(
      button => !button.closest('[aria-hidden="true"]'),
    ) ?? row.current;

  return {
    row,
    shownItems,
    pendingPrimaryId,
    shownPendingId,
    primaryError,
    setPrimary: onSetPrimary && !pendingPrimaryId && !holding ? (id: string) => void setPrimary(id) : undefined,
    removalFallback,
  };
}
