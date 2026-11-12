'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';

import { readingDirectionKeys, useDirection } from '../direction-provider';
import { useComposite } from '../hooks/use-composite';
import { type ComponentProps, type DefaultProps, isHTMLElement, mergeProps, useRender } from '../utils';
import { ComboboxChipsContext, type ComboboxChipsContextValue } from './combobox-chips-context';
import { useComboboxContext } from './combobox-context';

export type ComboboxChipsProps = ComponentProps<'div'>;

export const ComboboxChips = React.forwardRef<HTMLDivElement, ComboboxChipsProps>(function ComboboxChips(props, ref) {
  const { render, ...otherProps } = props;
  const { selectedValues, removeValue, focusInput, refs, setChipsElement } = useComboboxContext();

  const chipRefs = useRef(new Map<string, HTMLElement>());
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const direction = useDirection();
  const { previousKey, nextKey } = readingDirectionKeys(direction);
  const presentChips = () => selectedValues.flatMap(value => chipRefs.current.get(value) ?? []);

  const composite = useComposite(element, {
    getItems: presentChips,
    orientation: 'horizontal',
    loop: false,
    rtl: direction === 'rtl',
    stopPropagation: 'none',
    syncTabIndexes: () => {},
    getNextItem: (event, target, defaultNext) => {
      const chips = presentChips();
      if (event.key === nextKey && target === chips.at(-1)) {
        const input = refs.domReference.current;
        return isHTMLElement(input) ? input : null;
      }
      if (event.key === previousKey && target === chips[0]) {
        event.preventDefault();
        return null;
      }
      return defaultNext();
    },
  });

  const registerChip = useCallback((value: string, chip: HTMLElement | null) => {
    if (chip) {
      chipRefs.current.set(value, chip);
    } else {
      chipRefs.current.delete(value);
    }
  }, []);

  const focusLastChip = useCallback(() => {
    const last = selectedValues.at(-1);
    if (last !== undefined) {
      chipRefs.current.get(last)?.focus();
    }
  }, [selectedValues]);

  const removeChip = useCallback(
    (value: string, focusAfter: 'previous' | 'next') => {
      const index = selectedValues.indexOf(value);
      const target =
        focusAfter === 'previous'
          ? (selectedValues[index - 1] ?? selectedValues[index + 1])
          : selectedValues[index + 1];
      const chip = target === undefined ? undefined : chipRefs.current.get(target);
      if (chip) {
        chip.focus();
      } else {
        focusInput();
      }
      removeValue(value);
    },
    [selectedValues, removeValue, focusInput],
  );

  const contextValue = useMemo<ComboboxChipsContextValue>(
    () => ({ registerChip, navigate: composite.handleKeyDown, focusLastChip, removeChip }),
    [registerChip, composite.handleKeyDown, focusLastChip, removeChip],
  );

  const defaultProps = {
    role: selectedValues.length > 0 ? 'toolbar' : undefined,
    onMouseDown(event: React.MouseEvent<HTMLDivElement>) {
      if (event.target === event.currentTarget) {
        event.preventDefault();
        focusInput();
      }
    },
  } satisfies DefaultProps<'div'>;

  return (
    <ComboboxChipsContext.Provider value={contextValue}>
      {useRender({
        defaultTagName: 'div',
        render,
        ref: [setElement, setChipsElement, ref],
        props: mergeProps<'div'>(defaultProps, otherProps),
      })}
    </ComboboxChipsContext.Provider>
  );
});
