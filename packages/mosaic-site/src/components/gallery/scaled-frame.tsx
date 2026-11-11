'use client';
import * as React from 'react';

import { cn } from '@/lib/utils';
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;
export function ScaledFrame({
  width,
  center,
  interactive = false,
  className,
  children,
}: {
  width: number;
  center: boolean;
  interactive?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ scale: 1, height: 0, ready: false });
  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const measure = () => {
      const scale = element.clientWidth / width;
      setSize({ scale, height: element.clientHeight / scale, ready: true });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [width]);
  return (
    <div
      ref={ref}
      className={cn('relative overflow-hidden', className)}
    >
      <div
        className={cn(
          'absolute left-0 top-0',
          !interactive && 'pointer-events-none',
          center && 'flex items-center justify-center',
        )}
        style={{
          width,
          height: center ? size.height : undefined,
          transform: `scale(${size.scale})`,
          transformOrigin: 'top left',
          visibility: size.ready ? 'visible' : 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
}
