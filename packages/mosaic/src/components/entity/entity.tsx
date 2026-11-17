'use client';

import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { useRender } from '../../primitives/utils';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import { truncationStyles } from '../../styles/typography.styles';
import { withTruncatableLabel } from '../../utils/truncatable-label';
import * as slots from './entity.styles';

export type EntityRootProps = MosaicComponentProps<'div'>;

const Root = React.forwardRef<HTMLDivElement, EntityRootProps>(function MosaicEntity({ render, xstyle, ...rest }, ref) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('entity'), stylex.props(reset.base, slots.entity.base, xstyle), rest),
    },
  });
});

export type EntityMediaProps = MosaicComponentProps<'div'>;

const Media = React.forwardRef<HTMLDivElement, EntityMediaProps>(function MosaicEntityMedia(
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

export type EntityContentProps = MosaicComponentProps<'div'>;

const Content = React.forwardRef<HTMLDivElement, EntityContentProps>(function MosaicEntityContent(
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

export type EntityLabelProps = MosaicComponentProps<'div'>;

const Label = React.forwardRef<HTMLDivElement, EntityLabelProps>(function MosaicEntityLabel(
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

export type EntityDescriptionProps = MosaicComponentProps<'div'>;

const Description = React.forwardRef<HTMLDivElement, EntityDescriptionProps>(function MosaicEntityDescription(
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

declare namespace Root {
  type Props = EntityRootProps;
}

declare namespace Media {
  type Props = EntityMediaProps;
}

declare namespace Content {
  type Props = EntityContentProps;
}

declare namespace Label {
  type Props = EntityLabelProps;
}

declare namespace Description {
  type Props = EntityDescriptionProps;
}

export {
  Root as EntityRoot,
  Media as EntityMedia,
  Content as EntityContent,
  Label as EntityLabel,
  Description as EntityDescription,
};
