import { useSafeLayoutEffect } from '@clerk/shared/react';
import React, { useEffect } from 'react';

import { Button, useLocalizations } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';

type TimerButtonProps = PropsOfComponent<typeof Button> & {
  throttleTimeInSec?: number;
  startDisabled?: boolean;
  showCounter?: boolean;
};

export const TimerButton = (props: TimerButtonProps) => {
  const { t } = useLocalizations();
  const {
    onClick: onClickProp,
    throttleTimeInSec = 30,
    startDisabled,
    children,
    localizationKey,
    showCounter = true,
    ...rest
  } = props;
  const [remainingSeconds, setRemainingSeconds] = React.useState(0);
  const intervalIdRef = React.useRef<number | undefined>(undefined);

  useSafeLayoutEffect(() => {
    if (startDisabled) {
      disable();
    }
  }, []);

  useEffect(() => {
    return () => clearInterval(intervalIdRef.current);
  }, []);

  const disable = () => {
    setRemainingSeconds(throttleTimeInSec);
    intervalIdRef.current = window.setInterval(() => {
      setRemainingSeconds(seconds => {
        if (seconds === 1) {
          clearInterval(intervalIdRef.current);
        }
        return seconds - 1;
      });
    }, 1000);
  };

  const handleOnClick: React.MouseEventHandler<HTMLButtonElement> = e => {
    if (remainingSeconds) {
      return;
    }
    onClickProp?.(e);
    disable();
  };

  return (
    <Button
      variant='link'
      {...rest}
      textVariant='buttonSmall'
      isDisabled={remainingSeconds > 0 || props.isDisabled}
      onClick={handleOnClick}
    >
      {t(localizationKey) || children}
      {remainingSeconds && showCounter ? ` (${remainingSeconds})` : ''}
    </Button>
  );
};
