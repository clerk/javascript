import { useSafeLayoutEffect } from '@clerk/shared/react';
import React from 'react';

import { Icon } from '../components/icon';
import type { IconName } from '../icons/registry';
import { feedbackStyles } from './feedback.styles';

export function hasMessage(children: React.ReactNode) {
  return React.Children.toArray(children).some(child => child !== '');
}

export function useMessageHeight(active: HTMLElement | null) {
  const [height, setHeight] = React.useState(0);

  useSafeLayoutEffect(() => {
    if (!active) {
      return undefined;
    }

    const measure = () => setHeight(active.offsetHeight);
    measure();

    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver(measure);
    observer.observe(active);
    return () => observer.disconnect();
  }, [active]);

  return height;
}

export function useHeldMessage(children: React.ReactNode, open: boolean) {
  const held = React.useRef(children);
  if (open) {
    held.current = children;
  }
  return held.current;
}

export function FeedbackBody({ icon, children }: { icon: IconName; children: React.ReactNode }) {
  return (
    <>
      <Icon
        name={icon}
        size='sm'
        aria-hidden='true'
        xstyle={feedbackStyles.icon}
      />
      <span>{children}</span>
    </>
  );
}
