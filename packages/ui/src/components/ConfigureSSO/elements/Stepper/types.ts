import type React from 'react';

export interface StepperItemProps {
  /** The number shown in the bullet — typically the 1-indexed position. Replaced by a check icon when `isCompleted && !isCurrent`. */
  bullet: number;
  /** Whether this is the active item. Bullet renders in foreground color. */
  isCurrent?: boolean;
  /** Whether this item is past/done. Bullet renders the check icon in success color, label in foreground color. */
  isCompleted?: boolean;
  /** Whether the user can click this item to jump to it. When false, the button is `isDisabled`. Defaults to true. */
  isReachable?: boolean;
  /** Click handler. */
  onClick?: () => void;
  /** Label content rendered next to the bullet. Caller is responsible for any localization. */
  children: React.ReactNode;
}

export interface StepperProps {
  children: React.ReactNode;
}
