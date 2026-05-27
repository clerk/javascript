import autoAnimate from '@formkit/auto-animate';
import { cloneElement, type PropsWithChildren, useCallback, useEffect, useRef } from 'react';

import { useAppearance } from '@/customizables';

type AnimatedProps = PropsWithChildren<{ asChild?: boolean }>;

type AutoAnimateController = ReturnType<typeof autoAnimate>;

function useSafeAutoAnimate(): [(node: HTMLElement | null) => void] {
  const controllerRef = useRef<AutoAnimateController | null>(null);
  const nodeRef = useRef<HTMLElement | null>(null);

  const ref = useCallback((node: HTMLElement | null) => {
    if (node && node === nodeRef.current && controllerRef.current) {
      return;
    }
    if (controllerRef.current) {
      controllerRef.current.destroy?.();
      controllerRef.current = null;
    }
    nodeRef.current = node;
    if (node instanceof HTMLElement) {
      controllerRef.current = autoAnimate(node);
    }
  }, []);

  useEffect(() => {
    return () => {
      controllerRef.current?.destroy?.();
      controllerRef.current = null;
    };
  }, []);

  return [ref];
}

export const Animated = (props: AnimatedProps) => {
  const { children, asChild } = props;
  const { animations } = useAppearance().parsedOptions;
  const [parent] = useSafeAutoAnimate();

  if (asChild) {
    return cloneElement(children as any, { ref: animations ? parent : null });
  }

  return <div ref={animations ? parent : null}>{children}</div>;
};
