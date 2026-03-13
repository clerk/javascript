import { useCallback, useEffect, useRef, useState } from 'react';

import type { InspectedData } from './parseClerkElement';
import { parseClerkElement } from './parseClerkElement';

interface InspectorState {
  isActive: boolean;
  inspectedData: InspectedData | null;
  isFrozen: boolean;
  copiedValue: string | null;
}

export function useInspectorState() {
  const [state, setState] = useState<InspectorState>({
    isActive: false,
    inspectedData: null,
    isFrozen: false,
    copiedValue: null,
  });

  const copiedTimerRef = useRef<number | null>(null);
  const tooltipRef = useRef<HTMLElement | null>(null);

  const toggle = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: !prev.isActive,
      inspectedData: null,
      isFrozen: false,
      copiedValue: null,
    }));
  }, []);

  const deactivate = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: false,
      inspectedData: null,
      isFrozen: false,
      copiedValue: null,
    }));
  }, []);

  const unfreeze = useCallback(() => {
    setState(prev => ({ ...prev, isFrozen: false, copiedValue: null }));
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (state.isFrozen) {
        return;
      }
      const target = e.target as HTMLElement;
      if (!target) {
        return;
      }
      const data = parseClerkElement(target);
      setState(prev => ({ ...prev, inspectedData: data }));
    },
    [state.isFrozen],
  );

  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (state.isFrozen) {
        // If clicking inside the tooltip, let it through (for copy buttons)
        if (tooltipRef.current?.contains(e.target as Node)) {
          return;
        }
        // Clicking outside the tooltip unfreezes
        unfreeze();
        return;
      }

      if (!state.inspectedData) {
        return;
      }

      // Freeze the tooltip so user can interact with copy buttons
      e.preventDefault();
      e.stopPropagation();
      setState(prev => ({ ...prev, isFrozen: true }));
    },
    [state.inspectedData, state.isFrozen, unfreeze],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (state.isFrozen) {
          unfreeze();
        } else {
          deactivate();
        }
      }
    },
    [state.isFrozen, deactivate, unfreeze],
  );

  const setCopiedValue = useCallback((value: string) => {
    if (copiedTimerRef.current) {
      window.clearTimeout(copiedTimerRef.current);
    }
    setState(prev => ({ ...prev, copiedValue: value }));
    copiedTimerRef.current = window.setTimeout(() => {
      setState(prev => ({ ...prev, copiedValue: null }));
    }, 1500);
  }, []);

  useEffect(() => {
    if (!state.isActive) {
      return;
    }

    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, true);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [state.isActive, handleMouseMove, handleClick, handleKeyDown]);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) {
        window.clearTimeout(copiedTimerRef.current);
      }
    };
  }, []);

  const setTooltipRef = useCallback((el: HTMLElement | null) => {
    tooltipRef.current = el;
  }, []);

  return {
    isActive: state.isActive,
    inspectedData: state.inspectedData,
    isFrozen: state.isFrozen,
    copiedValue: state.copiedValue,
    toggle,
    deactivate,
    unfreeze,
    setCopiedValue,
    setTooltipRef,
  };
}
