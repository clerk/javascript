import type { PointerEventHandler } from 'react';
import { useCallback, useEffect, useRef } from 'react';

import { defaultRight, defaultTop, rightProperty, topProperty } from './impersonation-fab.constants';
import type { ImpersonationFabModel } from './impersonation-fab.model';

export type ImpersonationFabController =
  | { status: 'hidden' }
  | {
      status: 'ready';
      identifier: string;
      onSignOut: () => void;
      containerRef: React.RefObject<HTMLDivElement>;
      onPointerDown: PointerEventHandler;
    };

export function useImpersonationFabController(model: ImpersonationFabModel): ImpersonationFabController {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleResize = () => {
    const current = containerRef.current;
    if (!current) {
      return;
    }

    const offsetRight = window.innerWidth - current.offsetLeft - current.offsetWidth;
    const offsetBottom = window.innerHeight - current.offsetTop - current.offsetHeight;
    const outsideViewport = [current.offsetLeft, offsetRight, current.offsetTop, offsetBottom].some(
      offset => offset < 0,
    );

    if (outsideViewport) {
      document.documentElement.style.setProperty(rightProperty, `${defaultRight}px`);
      document.documentElement.style.setProperty(topProperty, `${defaultTop}px`);
    }
  };

  const onPointerMove = useCallback((event: PointerEvent) => {
    event.stopPropagation();
    event.preventDefault();
    const current = containerRef.current;
    if (!current) {
      return;
    }

    const rightOffset = `${window.innerWidth - current.offsetLeft - current.offsetWidth - event.movementX}px`;
    document.documentElement.style.setProperty(rightProperty, rightOffset);
    document.documentElement.style.setProperty(topProperty, `${current.offsetTop - -event.movementY}px`);
  }, []);

  const onPointerDown: PointerEventHandler = () => {
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener(
      'pointerup',
      () => {
        window.removeEventListener('pointermove', onPointerMove);
        handleResize();
      },
      { once: true },
    );
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (model.status !== 'ready') {
    return { status: model.status };
  }

  return {
    status: 'ready',
    identifier: model.identifier,
    onSignOut: model.onSignOut,
    containerRef,
    onPointerDown,
  };
}
