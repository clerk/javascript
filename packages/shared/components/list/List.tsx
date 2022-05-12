import cn from 'classnames';
import React from 'react';

import { ArrowRightIcon } from '../../assets/icons';
// @ts-ignore
import styles from './List.module.scss';

export type ListProps = React.PropsWithChildren<{
  className?: string;
}>;

export const List: React.FC<ListProps> & { Item: React.FC<React.PropsWithChildren<ListItemProps>> } & {
  EmptyPlaceholder: React.FC;
} = ({ className, children, ...rest }) => {
  return (
    <div
      {...rest}
      className={className}
    >
      {children}
    </div>
  );
};

export type ListItemProps = {
  itemTitle?: React.ReactNode;
  detail?: boolean;
  detailIcon?: JSX.Element | null;
  hoverable?: boolean;
  disabled?: boolean;
  lines?: boolean;
  onClick?: () => void;
  className?: string;
};

const Item: React.FC<React.PropsWithChildren<ListItemProps>> = ({
  detail = true,
  hoverable = true,
  lines = true,
  itemTitle,
  disabled = false,
  detailIcon,
  children,
  className,
  ...rest
}) => {
  const isButton = hoverable;
  const Element = isButton ? 'button' : 'div';
  const [startSlot, endSlot] = React.Children.toArray(children);

  return (
    <Element
      {...rest}
      disabled={disabled}
      className={cn(className, styles.elementContainer, {
        [styles.button]: isButton,
        [styles.hoverable]: hoverable,
        [styles.disabled]: disabled,
      })}
    >
      {itemTitle && <div className={styles.title}>{itemTitle}</div>}

      <div
        className={cn(styles.listItem, {
          [styles.line]: lines,
        })}
      >
        {startSlot && <div className={styles.start}>{startSlot}</div>}
        {endSlot && <div className={styles.end}>{endSlot}</div>}
        <div className={styles.iconContainer}>
          {detail &&
            (detailIcon ? <div className={styles.icon}>{detailIcon}</div> : <ArrowRightIcon className={styles.icon} />)}
        </div>
      </div>
    </Element>
  );
};

List.Item = Item;

const EmptyPlaceholder: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return <div className={styles.empty}>{children || 'None'}</div>;
};

List.EmptyPlaceholder = EmptyPlaceholder;
