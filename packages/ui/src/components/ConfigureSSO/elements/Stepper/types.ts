import type React from 'react';

import type { LocalizationKey } from '@/customizables';

export interface StepperItemProps {
  /** Display label. Resolved by the caller before passing in. */
  label?: LocalizationKey | string;
  /** Content to render inside the bullet circle (typically a number or a check icon). Caller decides what to show. */
  bullet?: React.ReactNode;
  /** Whether this is the active item. Bullet renders in foreground color. */
  isCurrent?: boolean;
  /** Whether this item is past/done. Bullet renders in success color, label in foreground color. */
  isCompleted?: boolean;
  /** Whether the user can click this item to jump to it. When false, the button is `isDisabled`. Defaults to true. */
  isReachable?: boolean;
  /** Click handler. Called regardless of `isReachable` — caller can no-op when not reachable, but the button itself just dispatches. */
  onClick?: () => void;
}

export interface StepperProps {
  children: React.ReactNode;
}
