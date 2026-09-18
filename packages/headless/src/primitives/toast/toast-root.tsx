'use client';

import { inertProps } from '@clerk/shared/inert';
import React, {
  type CSSProperties,
  type KeyboardEvent,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useTransition } from '../../hooks/use-transition';
import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../../utils';
import { ToastRootContext, type ToastRootContextValue, useToastContext } from './toast-context';
import type { ToastObject } from './toast-manager';

export interface ToastRootProps extends ComponentProps<'div'> {
  toast: ToastObject;
}

const visuallyHidden: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

function ToastAnnouncer(props: { toast: ToastObject }) {
  const { toast } = props;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(id);
  }, []);

  const assertive = toast.priority === 'high';

  return (
    <div
      role={assertive ? 'alert' : 'status'}
      aria-live={assertive ? 'assertive' : 'polite'}
      aria-atomic='true'
      style={visuallyHidden}
    >
      {ready ? (
        <>
          {toast.title}
          {toast.title != null && toast.description != null ? ' ' : null}
          {toast.description}
        </>
      ) : null}
    </div>
  );
}

export const ToastRoot = React.forwardRef<HTMLDivElement, ToastRootProps>(function ToastRoot(props, ref) {
  const { render, toast, children, ...otherProps } = props;
  const { toasts, close, remove, expanded, frontmost, setHeight, registerRoot } = useToastContext();

  const rootRef = useRef<HTMLDivElement | null>(null);
  const rootId = useId();
  const [titleId, setTitleId] = useState<string | undefined>(undefined);
  const [descriptionId, setDescriptionId] = useState<string | undefined>(undefined);

  const open = toast.transitionStatus !== 'ending';
  const { mounted, transitionProps } = useTransition({ open, ref: rootRef });

  useEffect(() => {
    if (!mounted) {
      remove(toast.id);
    }
  }, [mounted, remove, toast.id]);

  useLayoutEffect(() => {
    const element = rootRef.current;
    if (!element) {
      return;
    }
    const unregister = registerRoot(toast.id, element);
    const measure = () => setHeight(toast.id, element.offsetHeight);
    measure();
    if (typeof ResizeObserver === 'undefined') {
      return unregister;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      observer.disconnect();
      unregister();
    };
  }, [toast.id, registerRoot, setHeight]);

  const index = toasts.indexOf(toast);
  const offsetY = toasts.slice(0, Math.max(index, 0)).reduce((sum, t) => sum + (t.limited ? 0 : (t.height ?? 0)), 0);

  const behind = frontmost !== undefined && index > toasts.indexOf(frontmost);

  const contextValue = useMemo<ToastRootContextValue>(
    () => ({ toast, behind, rootId, titleId, descriptionId, setTitleId, setDescriptionId }),
    [toast, behind, rootId, titleId, descriptionId],
  );

  const style: CSSProperties & Record<`--${string}`, string | number> = {
    ...transitionProps.style,
    '--toast-index': index,
    '--toast-offset-y': `${offsetY}px`,
    '--toast-height': `${toast.height ?? 0}px`,
    '--toast-frontmost-height': `${frontmost?.height ?? 0}px`,
  };

  const transitionAttrs: Record<`data-${string}`, string> = {};
  if (transitionProps['data-starting-style'] !== undefined) {
    transitionAttrs['data-starting-style'] = '';
  }
  if (transitionProps['data-ending-style'] !== undefined) {
    transitionAttrs['data-ending-style'] = '';
  }

  const defaultProps = {
    role: 'dialog',
    'aria-modal': false,
    'aria-labelledby': titleId,
    'aria-describedby': descriptionId,
    tabIndex: 0,
    ...inertProps(toast.limited === true),
    ...transitionAttrs,
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        event.preventDefault();
        close(toast.id);
      }
    },
    style,
    children: (
      <>
        <ToastAnnouncer toast={toast} />
        {children}
      </>
    ),
  } satisfies DefaultProps<'div'>;

  return (
    <ToastRootContext.Provider value={contextValue}>
      {useRender({
        defaultTagName: 'div',
        render,
        enabled: mounted,
        ref: [rootRef, ref],
        state: { type: toast.type, expanded, limited: toast.limited === true },
        stateAttributesMapping: {
          type: v => (v ? { 'data-type': v } : null),
          expanded: v => (v ? { 'data-expanded': '' } : null),
          limited: v => (v ? { 'data-limited': '' } : null),
        },
        props: mergeProps<'div'>(defaultProps, otherProps),
      })}
    </ToastRootContext.Provider>
  );
});
