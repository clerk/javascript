'use client';

import { useListItem } from '@floating-ui/react';
import React, { useEffect, useId } from 'react';

import { type ComponentProps, type DefaultProps, isHTMLElement, mergeProps, useRender } from '../utils';
import { useAutocompleteHighlightContext, useAutocompleteOptionsContext } from './autocomplete-context';

export interface AutocompleteOptionProps extends ComponentProps<'div'> {
  value: string;
  label?: string;
  disabled?: boolean;
}

export const AutocompleteOption = React.forwardRef<HTMLDivElement, AutocompleteOptionProps>(
  function AutocompleteOption(props, ref) {
    const { activeIndex, selectedValue } = useAutocompleteHighlightContext();
    const { ref: itemRef, index } = useListItem({ label: props.label ?? props.value });
    return (
      <AutocompleteOptionBody
        {...props}
        forwardedRef={ref}
        listItemRef={itemRef}
        index={index}
        isActive={activeIndex === index}
        isSelected={selectedValue === props.value}
      />
    );
  },
);

interface AutocompleteOptionBodyProps extends AutocompleteOptionProps {
  forwardedRef: React.ForwardedRef<HTMLDivElement>;
  listItemRef: (node: HTMLElement | null) => void;
  index: number;
  isActive: boolean;
  isSelected: boolean;
}

const AutocompleteOptionBody = React.memo(function AutocompleteOptionBody(bodyProps: AutocompleteOptionBodyProps) {
  const { forwardedRef: ref, listItemRef: itemRef, index, isActive, isSelected, ...props } = bodyProps;
  const { render, value, label, disabled, ...otherProps } = props;
  const { getItemProps, handleSelect, valuesByIndexRef, registerSelectedIndex, refs } = useAutocompleteOptionsContext();

  const id = useId();
  const displayLabel = label ?? value;

  useEffect(() => {
    const map = valuesByIndexRef.current;
    if (!disabled) {
      map.set(index, value);
    }
    registerSelectedIndex(index, isSelected);
    return () => {
      map.delete(index);
    };
  }, [index, value, disabled, isSelected, valuesByIndexRef, registerSelectedIndex]);

  const state = {
    selected: isSelected,
    active: isActive,
    disabled: !!disabled,
  };

  const ownProps = {
    id,
    role: 'option',
    'aria-selected': isSelected,
    'aria-disabled': disabled || undefined,
  } satisfies DefaultProps<'div'>;

  const defaultProps = {
    ...ownProps,
    ...getItemProps({
      onClick() {
        if (!disabled) {
          handleSelect(value, index, displayLabel);
          const reference = refs.domReference.current;
          if (isHTMLElement(reference)) {
            reference.focus();
          }
        }
      },
    }),
  };

  const merged = mergeProps<'div'>(defaultProps, otherProps);
  // The option id is owned by the primitive and drives the input's
  // aria-activedescendant linkage: a consumer-supplied id must not override it.
  merged.id = id;

  return useRender({
    defaultTagName: 'div',
    render,
    ref: [itemRef, ref],
    state,
    stateAttributesMapping: {
      selected: (v: boolean) => (v ? { 'data-selected': '' } : null),
      active: (v: boolean) => (v ? { 'data-active': '' } : null),
      disabled: (v: boolean) => (v ? { 'data-disabled': '' } : null),
    },
    props: merged,
  });
});
