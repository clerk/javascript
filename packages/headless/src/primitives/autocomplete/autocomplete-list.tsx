'use client';

import { FloatingList, useMergeRefs } from '@floating-ui/react';
import React, { useEffect } from 'react';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useAutocompleteContext } from './autocomplete-context';

export type AutocompleteListProps = ComponentProps<'div'>;

export const AutocompleteList = React.forwardRef<HTMLDivElement, AutocompleteListProps>(
  function AutocompleteList(props, ref) {
    const { render, ...otherProps } = props;
    const { elementsRef, labelsRef, refs, getFloatingProps, setInlineMode } = useAutocompleteContext();

    useEffect(() => {
      setInlineMode(true);
      return () => setInlineMode(false);
    }, [setInlineMode]);

    // floating-ui types `setFloating` as a method signature, but at runtime it's
    // a stable callback that doesn't use `this`, so the unbound-method check is a
    // false positive here.
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const combinedRef = useMergeRefs([refs.setFloating, ref]);

    const floatingProps = getFloatingProps() as React.ComponentPropsWithRef<'div'>;
    const wiredId = floatingProps.id;

    const defaultProps = {
      'data-cl-slot': 'autocomplete-list',
      ref: combinedRef,
      ...floatingProps,
    };

    const merged = mergeProps<'div'>(defaultProps, otherProps);
    // The wired id is owned by the primitive: a consumer-supplied id must not
    // override it, or the aria-controls pairing would silently break.
    if (wiredId != null) {
      merged.id = wiredId;
    }

    return (
      <FloatingList
        elementsRef={elementsRef}
        labelsRef={labelsRef}
      >
        {renderElement({
          defaultTagName: 'div',
          render,
          props: merged,
        })}
      </FloatingList>
    );
  },
);
