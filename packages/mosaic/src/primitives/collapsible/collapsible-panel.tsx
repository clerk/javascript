'use client';

import React, { type CSSProperties } from 'react';

import { usePanelSize } from '../hooks/use-panel-size';
import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { useCollapsibleContext } from './collapsible-context';

export type CollapsiblePanelProps = ComponentProps<'div'>;

export const CollapsiblePanel = React.forwardRef<HTMLDivElement, CollapsiblePanelProps>(
  function CollapsiblePanel(props, ref) {
    const { render, ...otherProps } = props;
    const { open, triggerId, panelId } = useCollapsibleContext();

    const { panelRef, mounted, transitionProps, height, width } = usePanelSize(open);

    const state = { open };

    const style: CSSProperties & Record<`--${string}`, string | undefined> = {
      '--collapsible-panel-height': height != null ? `${height}px` : undefined,
      '--collapsible-panel-width': width != null ? `${width}px` : undefined,
      ...transitionProps.style,
    };

    const defaultProps = {
      id: panelId,
      role: 'region' as const,
      'aria-labelledby': triggerId,
      ...transitionProps,
      style,
    } satisfies DefaultProps<'div'>;

    const merged = mergeProps<'div'>(defaultProps, otherProps);
    // The wired id is owned by the primitive: a consumer-supplied id must not
    // override it, or the trigger/panel aria pairing would silently break.
    merged.id = panelId;

    return useRender({
      defaultTagName: 'div',
      render,
      enabled: mounted,
      ref: [panelRef, ref],
      state,
      stateAttributesMapping: {
        open: (v: boolean): Record<string, string> | null => (v ? { 'data-open': '' } : { 'data-closed': '' }),
      },
      props: merged,
    });
  },
);
