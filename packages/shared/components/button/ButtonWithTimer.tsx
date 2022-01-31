import React from 'react';
import { Button, ButtonProps } from './Button';

export type ButtonWithTimerProps = {
  throttleTimeInMs: number;
  startingState?: 'enabled' | 'disabled';
} & ButtonProps;

export function ButtonWithTimer({
  throttleTimeInMs,
  startingState = 'enabled',
  onClick,
  children,
  ...rest
}: ButtonWithTimerProps): JSX.Element {
  const [isDisabled, setIsDisabled] = React.useState(
    startingState === 'disabled',
  );

  React.useEffect(() => {
    if (startingState === 'disabled') {
      disableAndToggleAfterDelay();
    }
  }, []);

  const throttledClickHandler: React.MouseEventHandler<HTMLButtonElement> = (
    ...args
  ) => {
    disableAndToggleAfterDelay();
    onClick?.(...args);
  };

  const disableAndToggleAfterDelay = () => {
    setIsDisabled(true);
    setTimeout(() => setIsDisabled(false), throttleTimeInMs);
  };

  return (
    <Button disabled={isDisabled} onClick={throttledClickHandler} {...rest}>
      {children}
    </Button>
  );
}
