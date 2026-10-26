'use client';

import { FloatingList } from '@floating-ui/react';
import React, { useEffect } from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
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

    const floatingProps = getFloatingProps();
    const wiredId = floatingProps.id;

    const ownProps = {} satisfies DefaultProps<'div'>;

    const defaultProps = { ...ownProps, ...floatingProps };

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
        {useRender({
          defaultTagName: 'div',
          render,
          // eslint-disable-next-line @typescript-eslint/unbound-method -- floating-ui types `setFloating` as a method, but it is a stable callback that does not use `this`.
          ref: [refs.setFloating, ref],
          props: merged,
        })}
      </FloatingList>
    );
  },
);
