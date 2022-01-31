import React from 'react';
import cn from 'classnames';
// @ts-ignore
import styles from './Tooltip.module.scss';

export type TooltipProps = {
  children: React.ReactNode;
  content: string | React.ReactNode;
  delay?: number;
  direction?: 'top' | 'bottom' | 'left' | 'right';
  handleHide?: () => void;
  handleShow?: () => void;
  className?: string;
  tipClassName?: string;
};

export function Tooltip({
  children,
  content,
  delay = 400,
  direction = 'top',
  handleHide,
  handleShow,
  className,
  tipClassName,
}: TooltipProps): JSX.Element {
  let timeout: number;
  const [active, setActive] = React.useState(false);

  const showTip = () => {
    timeout = window.setTimeout(() => {
      setActive(true);

      if (typeof handleShow === 'function') {
        handleShow();
      }
    }, delay);
  };

  const hideTip = () => {
    clearInterval(timeout);
    setActive(false);

    if (typeof handleHide === 'function') {
      handleHide();
    }
  };

  return (
    <div
      className={cn(styles.container, className)}
      onMouseEnter={showTip}
      onMouseLeave={hideTip}
    >
      {children}
      {active && (
        <div
          className={cn(styles.tip, styles[direction || 'top'], tipClassName)}
        >
          {content}
        </div>
      )}
    </div>
  );
}
