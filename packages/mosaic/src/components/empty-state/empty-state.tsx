import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { IconName } from '../../icons/registry';
import type { MosaicComponentProps, MosaicElementProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../utils/reset.styles';
import { Icon, IconFrame } from '../icon';
import { styles } from './empty-state.styles';

export type EmptyStateProps = MosaicComponentProps<'div'>;

const Root = React.forwardRef<HTMLDivElement, EmptyStateProps>(function MosaicEmptyState(
  { render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeStyleProps(themeProps('empty-state'), stylex.props(reset.base, styles.root, xstyle), rest),
  });
});

export interface EmptyStateIconProps extends Omit<MosaicElementProps<'span'>, 'children'> {
  name: IconName;
}

const EmptyStateIcon = React.forwardRef<HTMLSpanElement, EmptyStateIconProps>(function MosaicEmptyStateIcon(
  { name, xstyle, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      {...mergeStyleProps(themeProps('empty-state-icon'), stylex.props(reset.base, styles.icon, xstyle), rest)}
    >
      <IconFrame filled>
        <Icon
          name={name}
          size='lg'
        />
      </IconFrame>
    </span>
  );
});

export type EmptyStateLabelProps = MosaicComponentProps<'p'>;

const Label = React.forwardRef<HTMLParagraphElement, EmptyStateLabelProps>(function MosaicEmptyStateLabel(
  { render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: mergeStyleProps(themeProps('empty-state-label'), stylex.props(reset.base, styles.label, xstyle), rest),
  });
});

export type EmptyStateDescriptionProps = MosaicComponentProps<'p'>;

const Description = React.forwardRef<HTMLParagraphElement, EmptyStateDescriptionProps>(
  function MosaicEmptyStateDescription({ render, xstyle, ...rest }, ref) {
    return useRender({
      defaultTagName: 'p',
      render,
      ref,
      props: mergeStyleProps(
        themeProps('empty-state-description'),
        stylex.props(reset.base, styles.description, xstyle),
        rest,
      ),
    });
  },
);

export type EmptyStateActionsProps = MosaicComponentProps<'div'>;

const Actions = React.forwardRef<HTMLDivElement, EmptyStateActionsProps>(function MosaicEmptyStateActions(
  { render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeStyleProps(themeProps('empty-state-actions'), stylex.props(reset.base, styles.actions, xstyle), rest),
  });
});

export const EmptyState = { Root, Icon: EmptyStateIcon, Label, Description, Actions };
