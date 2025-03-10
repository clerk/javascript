import { useAppearance } from '../customizables';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export function useMotionSafe() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { animations: layoutAnimations } = useAppearance().parsedLayout;
  return !prefersReducedMotion && layoutAnimations === true;
}
