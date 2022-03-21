import cn from 'classnames';
import React from 'react';

// @ts-ignore
import styles from './Menu.module.scss';

export type MenuOption = {
  label: React.ReactNode;
  icon?: React.ReactNode;
  isDestructiveAction?: boolean;
  handleSelect?: (o: Record<string, unknown>) => void;
};

export type MenuProps = {
  options: MenuOption[];
  children?: React.ReactNode;
  className?: string;
  style?: any;
};

export const Menu: React.FC<MenuProps> = ({ className, options, style }: MenuProps) => {
  return (
    <ul
      role='menu'
      className={cn(styles.menu, className)}
      style={style}
    >
      {options.map((option, i) => {
        const onClick = (e: React.MouseEvent<HTMLLIElement>) => {
          e.stopPropagation();
          if (typeof option.handleSelect === 'function') {
            option.handleSelect(option);
          }
        };

        return (
          <li
            key={i}
            role='menuitem'
            className={cn(styles.menuItem, {
              [styles.destructiveAction]: option.isDestructiveAction,
            })}
            onClick={onClick}
            tabIndex={0}
          >
            {option.icon && <div className={styles.iconContainer}>{option.icon}</div>}
            <div>{option.label}</div>
          </li>
        );
      })}
    </ul>
  );
};
