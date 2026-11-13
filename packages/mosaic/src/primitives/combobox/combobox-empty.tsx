'use client';

import React, { useEffect, useRef } from 'react';

import { type ComponentProps, type DefaultProps, isIOS, mergeProps, useRender } from '../utils';
import { useComboboxContext } from './combobox-context';

export type ComboboxEmptyProps = ComponentProps<'div'>;

const WORD_JOINER = '⁠';
const MARKER_DELAY_MS = 200;

/**
 * Status region that shows its children only when no `items` on the root match the search.
 * Keep it mounted while options are shown, so screen readers announce the message when it appears.
 */
export const ComboboxEmpty = React.forwardRef<HTMLDivElement, ComboboxEmptyProps>(function ComboboxEmpty(props, ref) {
  const { render, children, ...otherProps } = props;
  const { filteredItems } = useComboboxContext();
  const markerRef = useInitialTextMutation();

  const ownProps = {
    role: 'status',
    'aria-live': 'polite',
    'aria-atomic': true,
    children: filteredItems.length === 0 ? children : null,
  } satisfies DefaultProps<'div'>;

  return useRender({
    defaultTagName: 'div',
    render,
    ref: [markerRef, ref],
    props: mergeProps<'div'>(ownProps, otherProps),
  });
});

function useInitialTextMutation() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (root == null || isIOS()) {
      return;
    }
    const textNode = findLastTextNode(root);
    if (textNode == null) {
      return;
    }
    const original = textNode.nodeValue ?? '';
    const marked = `${original}${WORD_JOINER}`;
    textNode.nodeValue = marked;
    const restore = () => {
      if (textNode.nodeValue === marked) {
        textNode.nodeValue = original;
      }
    };
    const timer = setTimeout(restore, MARKER_DELAY_MS);
    return () => {
      clearTimeout(timer);
      restore();
    };
  }, []);

  return rootRef;
}

function findLastTextNode(root: HTMLElement): Text | null {
  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let last: Text | null = null;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node instanceof Text && node.nodeValue !== '') {
      last = node;
    }
  }
  return last;
}
