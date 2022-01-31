import React from 'react';
import cn from 'classnames';
import { Input, InputProps } from './Input';

// @ts-ignore
import styles from './InputWithIcon.module.scss';

export type InputWithIconProps = InputProps & {
  Icon: React.ReactNode;
  position?: 'left' | 'right';
};

export const InputWithIcon: React.FC<InputWithIconProps> = React.forwardRef(
  ({ Icon, position = 'left', ...rest }: InputWithIconProps, ref) => {
    return (
      <div className={cn(styles.container, styles[position])}>
        <div className={styles.iconContainer}>{Icon}</div>
        <Input ref={ref} {...rest} />
      </div>
    );
  },
);
InputWithIcon.displayName = 'InputWithIcon';
