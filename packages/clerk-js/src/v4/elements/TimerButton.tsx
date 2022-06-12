import React from 'react';

import { Button } from '../customizables';
import { useSafeLayoutEffect } from '../hooks';
import { PropsOfComponent } from '../styledSystem';

type TimerButtonProps = PropsOfComponent<typeof Button> & {
  throttleTimeInSec?: number;
  startDisabled?: boolean;
  showCounter?: boolean;
};

export const TimerButton = (props: TimerButtonProps) => {
  const { onClick: onClickProp, throttleTimeInSec = 30, startDisabled, children, showCounter = true, ...rest } = props;
  const [remainingSeconds, setRemainingSeconds] = React.useState(0);

  useSafeLayoutEffect(() => {
    if (startDisabled) {
      disable();
    }
  }, []);

  const disable = () => {
    setRemainingSeconds(throttleTimeInSec);
    const id = setInterval(() => {
      setRemainingSeconds(seconds => {
        if (seconds === 1) {
          clearInterval(id);
        }
        return seconds - 1;
      });
    }, 1000);
  };

  const handleOnClick: React.MouseEventHandler<HTMLButtonElement> = e => {
    if (remainingSeconds) {
      return;
    }
    props.onClick?.(e);
    disable();
  };

  return (
    <Button
      variant='link'
      {...rest}
      isDisabled={remainingSeconds > 0 || props.isDisabled}
      onClick={handleOnClick}
    >
      {children}
      {remainingSeconds && showCounter ? ` (${remainingSeconds})` : ''}
    </Button>
  );
};
