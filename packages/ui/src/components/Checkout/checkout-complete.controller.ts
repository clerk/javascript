import { useEffect, useId, useRef, useState } from 'react';

import { useDrawerContext } from '@/ui/elements/Drawer';

import { useAppearance } from '../../customizables';
import { usePrefersReducedMotion } from '../../hooks';
import type { CheckoutCompleteData, CheckoutCompleteModel } from './checkout.types';

const lerp = (start: number, end: number, amt: number) => start + (end - start) * amt;

export const useCheckoutCompleteController = (model: CheckoutCompleteModel): CheckoutCompleteData => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { animations: layoutAnimations } = useAppearance().parsedOptions;
  const canHover =
    typeof window === 'undefined' ? true : window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const { setIsOpen } = useDrawerContext();
  const [mousePosition, setMousePosition] = useState({ x: 256, y: 256 });
  const checkoutSuccessRootRef = useRef<HTMLSpanElement>(null);

  const handleMouseMove = (event: React.MouseEvent<HTMLSpanElement>) => {
    if (!canHover) {
      return;
    }
    if (checkoutSuccessRootRef.current) {
      const rect = checkoutSuccessRootRef.current.getBoundingClientRect();
      const domX = event.clientX - rect.left;
      const domY = event.clientY - rect.top;
      const domWidth = rect.width;

      const svgViewBoxWidth = 512;

      if (domWidth > 0) {
        const svgX = (domX / domWidth) * svgViewBoxWidth;
        const svgY = (domY / domWidth) * svgViewBoxWidth;
        setMousePosition({ x: svgX, y: svgY });
      } else {
        setMousePosition({ x: 256, y: 256 });
      }
    }
  };

  const handleClose = () => {
    model.navigateOnClose();
    if (setIsOpen) {
      setIsOpen(false);
    }
  };

  const { navigateOnClose: _navigateOnClose, ...data } = model;
  return {
    ...data,
    isMotionSafe: !prefersReducedMotion && layoutAnimations === true,
    canHover,
    mousePosition,
    checkoutSuccessRootRef,
    handleMouseMove,
    handleClose,
  };
};

export const useCheckoutSuccessRingController = (positionX: number, positionY: number) => {
  const animationRef = useRef<number | null>(null);
  const [currentPosition, setCurrentPosition] = useState({ x: 256, y: 256 });
  const canHover =
    typeof window === 'undefined' ? true : window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  useEffect(() => {
    if (!canHover) {
      return;
    }
    const animate = () => {
      setCurrentPosition(prev => {
        const amt = 0.15;
        const x = lerp(prev.x, positionX, amt);
        const y = lerp(prev.y, positionY, amt);
        return { x, y };
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [positionX, positionY, canHover]);

  // Generate unique IDs for SVG elements to avoid conflicts with multiple component instances
  const maskId1 = useId();
  const maskId2 = useId();
  const maskId3 = useId();

  return { currentPosition, canHover, maskId1, maskId2, maskId3 };
};
