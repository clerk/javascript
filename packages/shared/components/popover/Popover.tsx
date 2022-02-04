import cn from 'classnames';
import React from 'react';
import { usePopper } from 'react-popper';

import { MoreVerticalIcon } from '../../assets/icons';
import { useDetectClickOutside } from '../../hooks';
// @ts-ignore
import styles from './Popover.module.scss';

export type PopoverProps = {
  active?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: any;
};

export const Popover: React.FC<PopoverProps> = ({
  active,
  children,
  className,
  style,
}: PopoverProps) => {
  const popperRef = React.useRef(null);
  const referenceRef = React.useRef(null);
  const [isActive, setIsActive] = useDetectClickOutside(popperRef, !!active);

  const { styles: popperStyles, attributes, update } = usePopper(
    referenceRef.current,
    popperRef.current,
    {
      placement: 'right',
      modifiers: [
        {
          name: 'offset',
          enabled: true,
          options: {
            offset: [28, 10],
          },
        },
      ],
    },
  );

  React.useEffect(() => {
    if (typeof update === 'function') {
      void update();
    }
  }, [isActive]);

  const open = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsActive(true);
  };

  const close = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsActive(false);
  };

  // TODO: Add keyboard handling

  return (
    <>
      <button
        ref={referenceRef}
        onClick={open}
        className={styles.button}
        aria-haspopup='true'
        aria-expanded={isActive}
      >
        <MoreVerticalIcon />
      </button>
      <div
        ref={popperRef}
        style={popperStyles.popper}
        {...attributes.popper}
        onClick={close}
      >
        {isActive && (
          <div
            role='dialog'
            className={cn(styles.popover, className)}
            style={style}
          >
            {children}
          </div>
        )}
      </div>
    </>
  );
};
