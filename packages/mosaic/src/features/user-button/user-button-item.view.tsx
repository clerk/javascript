import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps, MosaicElementProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { focusOutline } from '../../utils/focus-outline.styles';
import { reset } from '../../utils/reset.styles';
import { truncationStyles } from '../../utils/typography.styles';
import { styles } from './user-button-item.styles';

export const UserButtonItem = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function UserButtonItem(
  { render, xstyle, ...rest },
  ref,
) {
  const interactive = Boolean(render);
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeStyleProps(
      themeProps('user-button-item', { interactive }),
      stylex.props(reset.base, focusOutline.visible, styles.root, interactive && styles.interactive, xstyle),
      rest,
    ),
  });
});

export function UserButtonItemMedia({ xstyle, ...rest }: MosaicElementProps<'div'>) {
  return (
    <div
      {...mergeStyleProps(themeProps('user-button-item-media'), stylex.props(reset.base, styles.media, xstyle), rest)}
    />
  );
}

export function UserButtonItemContent({ xstyle, ...rest }: MosaicElementProps<'div'>) {
  return (
    <div
      {...mergeStyleProps(
        themeProps('user-button-item-content'),
        stylex.props(reset.base, styles.content, xstyle),
        rest,
      )}
    />
  );
}

export type UserButtonItemLabelProps = MosaicElementProps<'div'> & {
  /**
   * `default` names the row's subject (a person, an organization) in its own color. `interactive`
   * takes the row's color, so it brightens with the row on hover. Use it where the text is the row
   * itself (`Add account`, `Sign out`).
   *
   * @default 'default'
   */
  variant?: 'default' | 'interactive';
};

export function UserButtonItemLabel({ variant = 'default', xstyle, ...rest }: UserButtonItemLabelProps) {
  return (
    <div
      {...mergeStyleProps(
        themeProps('user-button-item-label', { variant }),
        stylex.props(
          reset.base,
          styles.label,
          variant === 'default' && styles.labelDefault,
          truncationStyles.singleLine,
          xstyle,
        ),
        rest,
      )}
    />
  );
}

export function UserButtonItemDescription({ xstyle, ...rest }: MosaicElementProps<'div'>) {
  return (
    <div
      {...mergeStyleProps(
        themeProps('user-button-item-description'),
        stylex.props(reset.base, styles.description, truncationStyles.singleLine, xstyle),
        rest,
      )}
    />
  );
}

export function UserButtonItemTrailing({ xstyle, ...rest }: MosaicElementProps<'div'>) {
  return (
    <div
      {...mergeStyleProps(
        themeProps('user-button-item-trailing'),
        stylex.props(reset.base, styles.trailing, xstyle),
        rest,
      )}
    />
  );
}

export function UserButtonGroup({ xstyle, ...rest }: MosaicElementProps<'div'>) {
  return (
    <div {...mergeStyleProps(themeProps('user-button-group'), stylex.props(reset.base, styles.group, xstyle), rest)} />
  );
}

export function UserButtonSeparator({ xstyle, ...rest }: MosaicElementProps<'hr'>) {
  return (
    <hr
      {...mergeStyleProps(
        themeProps('user-button-separator'),
        stylex.props(reset.base, styles.separator, xstyle),
        rest,
      )}
    />
  );
}
