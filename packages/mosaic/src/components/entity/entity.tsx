import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { useRender } from '../../primitives/utils';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import { truncationStyles } from '../../styles/typography.styles';
import { withTruncatableLabel } from '../../utils/truncatable-label';
import * as slots from './entity.styles';

const Root = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function MosaicEntity(
  { render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('entity'), stylex.props(reset.base, slots.entity.base, xstyle), rest),
    },
  });
});

const Media = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function MosaicEntityMedia(
  { render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('entity-media'), stylex.props(reset.base, slots.media.base, xstyle), rest),
    },
  });
});

const Content = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function MosaicEntityContent(
  { render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('entity-content'), stylex.props(reset.base, slots.content.base, xstyle), rest),
    },
  });
});

const Label = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function MosaicEntityLabel(
  { children, render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('entity-label'), stylex.props(reset.base, slots.label.base, xstyle), rest),
      children: withTruncatableLabel(children),
    },
  });
});

const Description = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function MosaicEntityDescription(
  { render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('entity-description'),
        stylex.props(reset.base, slots.description.base, truncationStyles.singleLine, xstyle),
        rest,
      ),
    },
  });
});

export const Entity = {
  Root,
  Media,
  Content,
  Label,
  Description,
};
