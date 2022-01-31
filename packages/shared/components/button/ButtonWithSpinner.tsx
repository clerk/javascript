import React from 'react';
import { Button, ButtonProps } from './Button';
import { Spinner } from '../spinner';

export type ButtonWithSpinnerProps = {
  isLoading?: boolean;
  children: React.ReactNode;
  /** Custom loading style properties */
  loadingStyles?: React.CSSProperties;
} & ButtonProps;

export function ButtonWithSpinner({
  isLoading,
  children,
  loadingStyles = {},
  ...rest
}: ButtonWithSpinnerProps): JSX.Element {
  const [isSpinning, setIsSpinning] = React.useState(isLoading);

  React.useEffect(() => {
    if (isLoading) {
      setIsSpinning(true);
    }
    if (!isLoading && isSpinning) {
      const timeout = setTimeout(() => {
        setIsSpinning(false);
      }, 400);
      return () => clearTimeout(timeout);
    }
    return () => {
      //
    };
  }, [isLoading, isSpinning]);

  const [width, setWidth] = React.useState(0);
  const [height, setHeight] = React.useState(0);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const buttonStyles: React.CSSProperties =
    isSpinning && width > 0 && height > 0
      ? {
          width: width,
          height: height,
          alignItems: 'center',
          ...loadingStyles,
        }
      : {};

  React.useEffect(() => {
    if (buttonRef.current) {
      const { width, height } = buttonRef.current.getBoundingClientRect();
      setWidth(width);
      setHeight(height);
    }
  }, [isLoading]);

  return (
    <Button
      ref={buttonRef}
      style={{ display: 'flex', ...buttonStyles }}
      disabled={isLoading}
      {...rest}
    >
      {isSpinning ? <Spinner /> : children}
    </Button>
  );
}
