import * as stylex from '@stylexjs/stylex';
import type { ReactElement, ReactNode } from 'react';

import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import { truncationStyles } from '../../styles/typography.styles';
import { styles } from './switcher-header.styles';
import { useSlot } from './switcher-surface';

export interface SwitcherHeaderProps {
  avatar: ReactNode;
  title: string;
  description?: string;
}

export function SwitcherHeader({ avatar, title, description }: SwitcherHeaderProps): ReactElement {
  const slot = useSlot();
  return (
    <div {...mergeStyleProps(themeProps(slot('header')), stylex.props(reset.base, styles.root))}>
      {avatar}
      <div {...mergeStyleProps(themeProps(slot('header-content')), stylex.props(reset.base, styles.content))}>
        <div
          {...mergeStyleProps(
            themeProps(slot('header-title')),
            stylex.props(reset.base, styles.title, truncationStyles.singleLine),
          )}
        >
          {title}
        </div>
        {description ? (
          <div
            {...mergeStyleProps(
              themeProps(slot('header-description')),
              stylex.props(reset.base, styles.description, truncationStyles.singleLine),
            )}
          >
            {description}
          </div>
        ) : null}
      </div>
    </div>
  );
}
