import type React from 'react';

export interface StepperItemProps {
  /** The number shown in the bullet */
  bullet: number;
  isCurrent?: boolean;
  isCompleted?: boolean;
  /** When false, the button is `isDisabled`. Defaults to true. */
  isReachable?: boolean;
  onClick?: () => void;
  /** Caller is responsible for any localization. */
  children: React.ReactNode;
}

export interface StepperProps {
  children: React.ReactNode;
}
