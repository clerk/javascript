import * as stylex from '@stylexjs/stylex';
import type { ReactElement, ReactNode } from 'react';

import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../utils/reset.styles';
import { truncationStyles } from '../../utils/typography.styles';
import type { UserButtonHeaderLayout } from './user-button.types';
import { styles } from './user-button-header.styles';

export interface UserButtonHeaderProps {
  layout: UserButtonHeaderLayout;
  avatar: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function UserButtonHeader({ layout, avatar, title, description, actions }: UserButtonHeaderProps): ReactElement {
  return (
    <div {...mergeStyleProps(themeProps('user-button-header', { layout }), stylex.props(reset.base, styles.root))}>
      {avatar}
      <div {...mergeStyleProps(themeProps('user-button-header-content'), stylex.props(reset.base, styles.content))}>
        <div
          {...mergeStyleProps(
            themeProps('user-button-header-title'),
            stylex.props(reset.base, styles.title, truncationStyles.singleLine),
          )}
        >
          {title}
        </div>
        {description ? (
          <div
            {...mergeStyleProps(
              themeProps('user-button-header-description'),
              stylex.props(reset.base, styles.description, truncationStyles.singleLine),
            )}
          >
            {description}
          </div>
        ) : null}
      </div>
      {actions ? (
        <div
          {...mergeStyleProps(
            themeProps('user-button-header-actions'),
            stylex.props(reset.base, styles.actions, layout === 'stacked' && styles.actionsStacked),
          )}
        >
          {actions}
        </div>
      ) : null}
    </div>
  );
}
