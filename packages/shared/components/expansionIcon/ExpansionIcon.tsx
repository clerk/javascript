import React from 'react';
import cn from 'classnames';

// @ts-ignore
import styles from './ExpansionIcon.module.scss';
import { CaretIcon } from '../../assets/icons';
import type { SvgrComponent } from '../../assets/icons/svg';

type ExpansionIconProps = {
  isExpanded: boolean;
  /* Custom styles for the caret icon */
  iconClassName?: string;
  /* Styles for the transition between active <-> inactive */
  transitionClassName?: string;
  CustomExpansionIcon?: SvgrComponent;
};

/**
 * Expansion icon used across apps to show expansion panel state, dropdowns and more.
 */
export function ExpansionIcon({
  isExpanded,
  iconClassName,
  transitionClassName,
  CustomExpansionIcon,
}: ExpansionIconProps): JSX.Element {
  const Icon = CustomExpansionIcon || CaretIcon;
  return (
    <Icon
      className={cn(
        styles.caret,
        { [transitionClassName || styles.activeCaret]: isExpanded },
        iconClassName,
      )}
    />
  );
}
