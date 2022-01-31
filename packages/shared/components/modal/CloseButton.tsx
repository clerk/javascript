import React from 'react';
import { ModalContext } from './context';

export type CloseButtonProps = {
  children: React.ReactNode;
  handleClick?: (e: React.MouseEvent) => void;
};

const CloseButton = ({
  children,
  handleClick,
  ...rest
}: CloseButtonProps): JSX.Element | null => {
  const { close } = React.useContext(ModalContext);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (typeof close === 'function') {
      close();
    }

    if (typeof handleClick === 'function') {
      handleClick(e);
    }
  };

  const child = React.Children.only(children) as React.ReactElement<{
    onClick: (e: React.MouseEvent) => void;
  }>;

  if (React.isValidElement(child)) {
    return React.cloneElement(child, {
      ...rest,
      onClick,
    });
  }

  return null;
};

CloseButton.displayName = 'CloseButton';

export { CloseButton };
