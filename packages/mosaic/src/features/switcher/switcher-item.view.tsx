import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { useRender } from '../../primitives/utils';
import type { MosaicComponentProps, MosaicElementProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { focusOutline } from '../../styles/focus-outline.styles';
import { reset } from '../../styles/reset.styles';
import { truncationStyles } from '../../styles/typography.styles';
import { styles } from './switcher-item.styles';
import { useSlot } from './switcher-surface';

export const SwitcherItem = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function SwitcherItem(
  { render, xstyle, ...rest },
  ref,
) {
  const slot = useSlot();
  const interactive = Boolean(render);
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeStyleProps(
      themeProps(slot('item'), { interactive }),
      stylex.props(reset.base, focusOutline.visible, styles.root, interactive && styles.interactive, xstyle),
      rest,
    ),
  });
});

export function SwitcherItemMedia({ xstyle, ...rest }: MosaicElementProps<'div'>) {
  const slot = useSlot();
  return (
    <div {...mergeStyleProps(themeProps(slot('item-media')), stylex.props(reset.base, styles.media, xstyle), rest)} />
  );
}

export function SwitcherItemContent({ xstyle, ...rest }: MosaicElementProps<'div'>) {
  const slot = useSlot();
  return (
    <div
      {...mergeStyleProps(themeProps(slot('item-content')), stylex.props(reset.base, styles.content, xstyle), rest)}
    />
  );
}

export type SwitcherItemLabelProps = MosaicElementProps<'div'> & {
  /**
   * `default` names the row's subject (a person, an organization) in its own color. `interactive`
   * takes the row's color, so it brightens with the row on hover. Use it where the text is the row
   * itself (`Add account`, `Sign out`).
   *
   * @default 'default'
   */
  variant?: 'default' | 'interactive';
};

export function SwitcherItemLabel({ variant = 'default', xstyle, ...rest }: SwitcherItemLabelProps) {
  const slot = useSlot();
  return (
    <div
      {...mergeStyleProps(
        themeProps(slot('item-label'), { variant }),
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

export function SwitcherItemDescription({ xstyle, ...rest }: MosaicElementProps<'div'>) {
  const slot = useSlot();
  return (
    <div
      {...mergeStyleProps(
        themeProps(slot('item-description')),
        stylex.props(reset.base, styles.description, truncationStyles.singleLine, xstyle),
        rest,
      )}
    />
  );
}

export function SwitcherItemTrailing({ xstyle, ...rest }: MosaicElementProps<'div'>) {
  const slot = useSlot();
  return (
    <div
      {...mergeStyleProps(themeProps(slot('item-trailing')), stylex.props(reset.base, styles.trailing, xstyle), rest)}
    />
  );
}

export function SwitcherGroup({ xstyle, ...rest }: MosaicElementProps<'div'>) {
  const slot = useSlot();
  return <div {...mergeStyleProps(themeProps(slot('group')), stylex.props(reset.base, styles.group, xstyle), rest)} />;
}

export function SwitcherSeparator({ xstyle, ...rest }: MosaicElementProps<'hr'>) {
  const slot = useSlot();
  return (
    <hr {...mergeStyleProps(themeProps(slot('separator')), stylex.props(reset.base, styles.separator, xstyle), rest)} />
  );
}
