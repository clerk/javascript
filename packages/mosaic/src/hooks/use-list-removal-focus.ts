import { useRef } from 'react';

export function useListRemovalFocus({
  ids,
  onRemove,
  fallback,
}: {
  ids: string[];
  onRemove?: (id: string) => void | Promise<void>;
  fallback: () => HTMLElement | null;
}) {
  const triggers = useRef(new Map<string, HTMLButtonElement>());
  const removed = useRef<{ id: string; index: number } | undefined>(undefined);

  const registerTrigger = (id: string) => (element: HTMLButtonElement | null) => {
    if (element) {
      triggers.current.set(id, element);
    } else {
      triggers.current.delete(id);
    }
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
    return (next ? triggers.current.get(next) : undefined) ?? fallback();
  };

  return { registerTrigger, remove, finalFocus };
}
