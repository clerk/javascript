import { activeElement, contains, getDocument, useLatestRef } from '@floating-ui/react/utils';
import React from 'react';

export type SetTabIndex = (element: HTMLElement, tabIndex: 0 | -1 | null) => void;

export type CompositeKeyEvent = Pick<
  KeyboardEvent,
  'key' | 'target' | 'ctrlKey' | 'metaKey' | 'preventDefault' | 'stopPropagation'
>;

export interface UseCompositeOptions {
  getItems: () => HTMLElement[];
  orientation?: 'horizontal' | 'vertical' | 'both';
  loop?: boolean;
  rtl?: boolean;
  enabled?: boolean;
  preferred?: { getItem: () => HTMLElement | undefined; key?: unknown };
  getNextItem?: (
    event: CompositeKeyEvent,
    target: HTMLElement,
    defaultNext: () => HTMLElement | null,
  ) => HTMLElement | null;
  resolveFocus?: (target: HTMLElement) => HTMLElement | null;
  syncTabIndexes?: (active: HTMLElement | null, setTabIndex: SetTabIndex) => void;
  onNavigate?: (item: HTMLElement) => void;
  homeEnd?: boolean;
  recoverFocus?: boolean;
  stopPropagation?: 'arrows' | 'all' | 'none';
}

export interface UseCompositeReturn {
  setActive: (item: HTMLElement) => void;
  handleKeyDown: (event: CompositeKeyEvent) => void;
}

export interface CompositeItems {
  getItems: () => HTMLElement[];
  getItem: (value: string) => HTMLElement | undefined;
  getValue: (item: HTMLElement) => string | undefined;
  register: (item: HTMLElement, value: string | undefined) => void;
  unregister: (item: HTMLElement) => void;
}

const CompositeItemsContext = React.createContext<CompositeItems>({
  getItems: () => [],
  getItem: () => undefined,
  getValue: () => undefined,
  register: () => {},
  unregister: () => {},
});

export const CompositeItemsProvider = CompositeItemsContext.Provider;

export function useCompositeItems(): CompositeItems {
  const [items] = React.useState(createCompositeItems);
  return items;
}

export function useCompositeItem(value?: string): React.RefCallback<HTMLElement> {
  const { register, unregister } = React.useContext(CompositeItemsContext);
  const registeredRef = React.useRef<HTMLElement | null>(null);
  return React.useCallback(
    (item: HTMLElement | null) => {
      if (registeredRef.current) {
        unregister(registeredRef.current);
      }
      registeredRef.current = item;
      if (item) {
        register(item, value);
      }
    },
    [register, unregister, value],
  );
}

export function useComposite(element: HTMLElement | null, options: UseCompositeOptions): UseCompositeReturn {
  const { enabled = true, preferred } = options;
  const preferredKey = preferred?.key;
  const optionsRef = useLatestRef(options);
  const activeRef = React.useRef<HTMLElement | null>(null);
  const activeIndexRef = React.useRef(0);
  const focusedRef = React.useRef(false);
  const originalTabIndexes = React.useRef(new Map<HTMLElement, string | null>());

  const setTabIndex = React.useCallback<SetTabIndex>((target, tabIndex) => {
    if (!originalTabIndexes.current.has(target)) {
      originalTabIndexes.current.set(target, target.getAttribute('tabindex'));
    }
    if (tabIndex === null) {
      target.removeAttribute('tabindex');
    } else {
      target.tabIndex = tabIndex;
    }
  }, []);

  const sync = React.useCallback(() => {
    if (!element) {
      return;
    }
    const { getItems, preferred: preferredOption, syncTabIndexes, recoverFocus } = optionsRef.current;
    const items = getItems();
    const lostActive = !isUsable(activeRef.current, items);
    if (lostActive) {
      const preferredItem = preferredOption?.getItem();
      activeRef.current = isUsable(preferredItem, items) ? preferredItem : nearestItem(items, activeIndexRef.current);
    }
    const active = activeRef.current;
    if (active) {
      activeIndexRef.current = items.indexOf(active);
    }
    forgetDisconnected(originalTabIndexes.current);
    if (syncTabIndexes) {
      syncTabIndexes(active, setTabIndex);
    } else {
      for (const item of items) {
        setTabIndex(item, item === active ? 0 : -1);
      }
    }
    if (recoverFocus && lostActive && focusedRef.current && !contains(element, activeElement(getDocument(element)))) {
      active?.focus();
    }
  }, [element, optionsRef, setTabIndex]);

  const setActive = React.useCallback(
    (item: HTMLElement) => {
      activeRef.current = item;
      sync();
    },
    [sync],
  );

  React.useLayoutEffect(() => {
    activeRef.current = null;
  }, [preferredKey]);

  React.useLayoutEffect(() => {
    if (enabled) {
      sync();
    }
  });

  React.useLayoutEffect(() => {
    if (!enabled || !element) {
      return;
    }
    const originals = originalTabIndexes.current;
    const observer = new MutationObserver(sync);
    observer.observe(element, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'aria-disabled'],
    });

    const onFocusIn = (event: FocusEvent) => {
      const { target } = event;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      focusedRef.current = true;
      const { getItems, resolveFocus } = optionsRef.current;
      const item = resolveFocus ? resolveFocus(target) : getItems().includes(target) ? target : null;
      if (item) {
        setActive(item);
      }
    };

    const onFocusOut = (event: FocusEvent) => {
      const { target, relatedTarget } = event;
      if (
        target instanceof Element &&
        target.isConnected &&
        !(relatedTarget instanceof Element && contains(element, relatedTarget))
      ) {
        focusedRef.current = false;
      }
    };

    element.addEventListener('focusin', onFocusIn);
    element.addEventListener('focusout', onFocusOut);
    return () => {
      observer.disconnect();
      element.removeEventListener('focusin', onFocusIn);
      element.removeEventListener('focusout', onFocusOut);
      restoreTabIndexes(originals);
    };
  }, [enabled, element, optionsRef, sync, setActive]);

  const handleKeyDown = React.useCallback(
    (event: CompositeKeyEvent) => {
      const { target } = event;
      const current = optionsRef.current;
      if (current.enabled === false || !(target instanceof HTMLElement)) {
        return;
      }
      const defaultNext = () => defaultNextItem(event, target, current);
      const next = current.getNextItem ? current.getNextItem(event, target, defaultNext) : defaultNext();
      if (!next) {
        return;
      }
      event.preventDefault();
      if (stopsPropagation(event.key, current.stopPropagation)) {
        event.stopPropagation();
      }
      setActive(next);
      next.focus();
      current.onNavigate?.(next);
    },
    [optionsRef, setActive],
  );

  return React.useMemo(() => ({ setActive, handleKeyDown }), [setActive, handleKeyDown]);
}

function createCompositeItems(): CompositeItems {
  const items = new Map<HTMLElement, string | undefined>();
  const getItems = () => Array.from(items.keys()).sort(sortByDocumentPosition);
  return {
    getItems,
    getItem: value => getItems().find(item => items.get(item) === value),
    getValue: item => items.get(item),
    register: (item, value) => {
      items.set(item, value);
    },
    unregister: item => {
      items.delete(item);
    },
  };
}

function sortByDocumentPosition(a: HTMLElement, b: HTMLElement) {
  const position = a.compareDocumentPosition(b);
  if (position & Node.DOCUMENT_POSITION_FOLLOWING || position & Node.DOCUMENT_POSITION_CONTAINED_BY) {
    return -1;
  }
  if (position & Node.DOCUMENT_POSITION_PRECEDING || position & Node.DOCUMENT_POSITION_CONTAINS) {
    return 1;
  }
  return 0;
}

function defaultNextItem(event: CompositeKeyEvent, target: HTMLElement, options: UseCompositeOptions) {
  const { getItems, orientation = 'both', loop = true, rtl = false, homeEnd = true } = options;
  const items = getItems();
  const index = items.indexOf(target);
  if (index === -1) {
    return null;
  }
  const enabled = items.filter(item => !isDisabled(item));
  switch (stepFor(event.key, orientation, rtl, homeEnd)) {
    case 'first':
      return enabled[0] ?? null;
    case 'last':
      return enabled.at(-1) ?? null;
    case 'next':
      return items.slice(index + 1).find(item => !isDisabled(item)) ?? (loop ? (enabled[0] ?? null) : null);
    case 'previous':
      return items.slice(0, index).findLast(item => !isDisabled(item)) ?? (loop ? (enabled.at(-1) ?? null) : null);
    case null:
      return null;
  }
}

function stopsPropagation(key: string, mode: UseCompositeOptions['stopPropagation'] = 'arrows') {
  return mode === 'all' || (mode === 'arrows' && key.startsWith('Arrow'));
}

function stepFor(
  key: string,
  orientation: NonNullable<UseCompositeOptions['orientation']>,
  rtl: boolean,
  homeEnd: boolean,
) {
  const horizontal = orientation !== 'vertical';
  const vertical = orientation !== 'horizontal';
  if (homeEnd && key === 'Home') {
    return 'first';
  }
  if (homeEnd && key === 'End') {
    return 'last';
  }
  if ((horizontal && key === (rtl ? 'ArrowLeft' : 'ArrowRight')) || (vertical && key === 'ArrowDown')) {
    return 'next';
  }
  if ((horizontal && key === (rtl ? 'ArrowRight' : 'ArrowLeft')) || (vertical && key === 'ArrowUp')) {
    return 'previous';
  }
  return null;
}

function isUsable(item: HTMLElement | null | undefined, items: HTMLElement[]): item is HTMLElement {
  return !!item && items.includes(item) && !item.matches(':disabled');
}

function isDisabled(item: HTMLElement) {
  return item.matches(':disabled, [aria-disabled="true"]');
}

function nearestItem(items: HTMLElement[], index: number) {
  const byDistance = items
    .map((item, position) => ({ item, distance: Math.abs(position - index) }))
    .sort((a, b) => a.distance - b.distance)
    .map(({ item }) => item);
  return byDistance.find(item => !isDisabled(item)) ?? byDistance.find(item => !item.matches(':disabled')) ?? null;
}

function forgetDisconnected(originals: Map<HTMLElement, string | null>) {
  for (const target of originals.keys()) {
    if (!target.isConnected) {
      originals.delete(target);
    }
  }
}

function restoreTabIndexes(originals: Map<HTMLElement, string | null>) {
  for (const [target, tabIndex] of originals) {
    if (tabIndex === null) {
      target.removeAttribute('tabindex');
    } else {
      target.setAttribute('tabindex', tabIndex);
    }
  }
  originals.clear();
}
