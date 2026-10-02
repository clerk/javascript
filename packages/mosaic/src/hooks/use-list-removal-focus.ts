import { useRef } from 'react';

interface RemovalTrigger {
  element: HTMLButtonElement | null;
  ref: (element: HTMLButtonElement | null) => void;
}

export function useListRemovalFocus({
  ids,
  onRemove,
  fallback,
}: {
  ids: string[];
  onRemove?: (id: string) => void | Promise<void>;
  fallback: () => HTMLElement | null;
}) {
  const triggers = useRef(new Map<string, RemovalTrigger>());
  const removed = useRef<{ id: string; index: number } | undefined>(undefined);

  const registerTrigger = (id: string) => {
    const existing = triggers.current.get(id);
    if (existing) {
      return existing.ref;
    }
    const trigger: RemovalTrigger = {
      element: null,
      ref: element => {
        trigger.element = element;
        if (element === null) {
          triggers.current.delete(id);
        } else {
          triggers.current.set(id, trigger);
        }
      },
    };
    triggers.current.set(id, trigger);
    return trigger.ref;
  };

  const remove = async (id: string) => {
    if (!onRemove) {
      return;
    }
    const index = ids.indexOf(id);
    await onRemove(id);
    removed.current = { id, index };
  };

  const finalFocus = () => {
    const item = removed.current;
    removed.current = undefined;
    if (!item) {
      return null;
    }
    const remaining = ids.filter(id => id !== item.id);
    const next = remaining[Math.min(item.index, remaining.length - 1)];
    return (next ? triggers.current.get(next)?.element : undefined) ?? fallback();
  };

  return { registerTrigger, remove, finalFocus };
}
